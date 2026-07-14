// Collection Pre-request — общий для всех запросов Olymp
const baseUrl = pm.environment.get("base_url") || "https://api.qasandbox.ru/api";
pm.environment.set("base_url", baseUrl);

// Уникальные данные для регистрации / создания (не затираем, если уже заданы вручную)
if (!pm.environment.get("run_id")) {
    pm.environment.set("run_id", Date.now().toString());
}

const runId = pm.environment.get("run_id");
if (!pm.environment.get("username")) {
    pm.environment.set("username", `qa_user_${runId}`);
}
if (!pm.environment.get("password")) {
    pm.environment.set("password", `Qa_Pass_${runId.slice(-6)}!`);
}

// Bearer token, если уже получен после Login
const token = pm.environment.get("token");
if (token) {
    pm.request.headers.upsert({
        key: "Authorization",
        value: `Bearer ${token}`
    });
}

// Базовые JSON-заголовки
pm.request.headers.upsert({ key: "Accept", value: "application/json" });
if (["POST", "PUT", "PATCH"].includes(pm.request.method)) {
    pm.request.headers.upsert({ key: "Content-Type", value: "application/json" });
}

console.log(`[PRE] ${pm.request.method} ${pm.info.requestName}`);
