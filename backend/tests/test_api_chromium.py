"""Pruebas autónomas del servicio TelecomHub API con Chromium embebido (Playwright).

Cubre el planteamiento:
1. Registro con usuario y contraseña.
2. Login correcto -> mensaje de autenticación satisfactoria.
3. Login incorrecto -> error en la autenticación.

Ejecución con el venv del proyecto:
    .venv\\Scripts\\python.exe tests\\test_api_chromium.py
"""

import json
import subprocess
import sys
import time
import urllib.request
from datetime import datetime
from pathlib import Path

# URL base del servicio web (debe coincidir con src/index.js).
BASE_URL = "http://localhost:3001"
# Ruta del ejecutable de Node instalado a nivel usuario.
NODE_EXE = Path.home() / "AppData" / "Local" / "nodejs" / "node.exe"
# Directorio raíz de la API (padre de tests/).
API_DIR = Path(__file__).resolve().parent.parent


def esperar_servicio(timeout_seg=15):
    """Esperar a que GET /api/salud responda. Si no hay servidor, arrancarlo."""
    inicio = time.time()
    proceso = None
    while time.time() - inicio < timeout_seg:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/api/salud", timeout=2) as r:
                if r.status == 200:
                    return proceso
        except Exception:
            pass
        # Si el servidor no responde y aún no lo arrancamos, lanzarlo con Node.
        if proceso is None:
            try:
                with urllib.request.urlopen(f"{BASE_URL}/api/salud", timeout=1):
                    pass
            except Exception:
                print("Servidor no detectado, arrancando Node en segundo plano...")
                proceso = subprocess.Popen(
                    [str(NODE_EXE), "src/index.js"],
                    cwd=str(API_DIR),
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
        time.sleep(1)
    raise RuntimeError("El servicio no respondió en /api/salud")


def main():
    """Orquestar las pruebas dentro de Chromium embebido."""
    from playwright.sync_api import sync_playwright

    proceso_node = esperar_servicio()
    resultados = []
    usuario = f"test_{int(time.time())}"  # Usuario único por ejecución.
    clave = "123456"

    # Script JS que se ejecuta DENTRO de Chromium: usa fetch contra la API.
    # Devuelve {status, body} para poder asertar códigos y mensajes.
    js_fetch = """async ({url, method, payload}) => {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: payload ? JSON.stringify(payload) : undefined,
        });
        let body = null;
        try { body = await res.json(); } catch (e) { body = null; }
        return {status: res.status, body};
    }"""

    with sync_playwright() as p:
        # Lanzar Chromium embebido de Playwright en modo headless.
        navegador = p.chromium.launch()
        pagina = navegador.new_page()
        # Navegar al mismo origen de la API: así fetch es same-origin y
        # se evita el preflight CORS de origen nulo (about:blank).
        pagina.goto(f"{BASE_URL}/api/salud")

        def llamar(ruta, metodo="GET", payload=None):
            """Helper: petición HTTP desde dentro del navegador."""
            return pagina.evaluate(js_fetch, {"url": BASE_URL + ruta, "method": metodo, "payload": payload})

        def registrar(nombre, ok_esperado, detalle):
            """Registrar un resultado y mostrarlo por consola."""
            resultados.append({"prueba": nombre, "ok": ok_esperado, "detalle": detalle})
            print(f"{'PASS' if ok_esperado else 'FAIL'} - {nombre}: {detalle}")

        # 1. Salud del servicio.
        r = llamar("/api/salud")
        registrar("GET /api/salud", r["status"] == 200 and r["body"].get("ok") is True, str(r["body"]))

        # 2. Registro de usuario nuevo -> 201.
        r = llamar("/api/auth/registro", "POST", {"username": usuario, "password": clave})
        registrar("POST /registro nuevo -> 201", r["status"] == 201 and r["body"].get("ok") is True, str(r["body"]))

        # 3. Registro duplicado -> 409.
        r = llamar("/api/auth/registro", "POST", {"username": usuario, "password": clave})
        registrar("POST /registro duplicado -> 409", r["status"] == 409, str(r["body"]))

        # 4. Login correcto -> 200 + mensaje satisfactoria + token.
        r = llamar("/api/auth/login", "POST", {"username": usuario, "password": clave})
        ok_login = r["status"] == 200 and "satisfactoria" in (r["body"].get("mensaje") or "").lower()
        ok_token = bool(r["body"].get("token"))
        registrar("POST /login correcto -> 200 satisfactoria", ok_login and ok_token, str(r["body"])[:200])

        # 5. Login con clave errónea -> 401 error autenticación.
        r = llamar("/api/auth/login", "POST", {"username": usuario, "password": "clave-mala"})
        ok_err = r["status"] == 401 and "error" in (r["body"].get("mensaje") or "").lower()
        registrar("POST /login clave mala -> 401", ok_err, str(r["body"]))

        # 6. Login usuario inexistente -> 401.
        r = llamar("/api/auth/login", "POST", {"username": "noexiste_xyz", "password": clave})
        registrar("POST /login inexistente -> 401", r["status"] == 401, str(r["body"]))

        # 7. Validación: contraseña corta -> 400.
        r = llamar("/api/auth/registro", "POST", {"username": "corto", "password": "123"})
        registrar("POST /registro clave corta -> 400", r["status"] == 400, str(r["body"]))

        # 8. Alias en español: usuario/contrasena -> 201 y login 200.
        alias = usuario + "_es"
        r = llamar("/api/auth/registro", "POST", {"usuario": alias, "contrasena": clave})
        ok_alias_reg = r["status"] == 201
        r2 = llamar("/api/auth/login", "POST", {"usuario": alias, "contrasena": clave})
        registrar("Alias usuario/contrasena ES", ok_alias_reg and r2["status"] == 200, f"reg={r['status']} login={r2['status']}")

        # Evidencia visual: captura del estado final en el navegador.
        pagina.set_content(f"<h1>TelecomHub API OK</h1><pre>{json.dumps(resultados, ensure_ascii=False, indent=2)}</pre>")
        pagina.screenshot(path=str(Path(__file__).parent / "evidencia.png"))
        navegador.close()

    # Guardar reporte JSON con fecha y resumen.
    reporte = {
        "fecha": datetime.now().isoformat(timespec="seconds"),
        "base_url": BASE_URL,
        "pasaron": sum(1 for x in resultados if x["ok"]),
        "total": len(resultados),
        "resultados": resultados,
    }
    (Path(__file__).parent / "reporte.json").write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nResumen: {reporte['pasaron']}/{reporte['total']} pasaron. Ver tests/reporte.json y tests/evidencia.png")

    # Si arrancamos Node desde aquí, dejarlo vivo para uso manual (no matarlo).
    if proceso_node is not None:
        print(f"Node arrancado por el script (PID {proceso_node.pid}), se deja en ejecución.")

    # Código de salida: 0 si todo pasa, 1 si algo falla (útil para CI).
    sys.exit(0 if reporte["pasaron"] == reporte["total"] else 1)


if __name__ == "__main__":
    main()
