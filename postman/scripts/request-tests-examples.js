// Примеры request-level Tests для сценариев Olymp
// (в коллекции JSON эти блоки уже привязаны к запросам)

// --- Registry 201 ---
pm.test("Регистрация: статус 201", () => pm.response.to.have.status(201));
pm.test("Регистрация: сообщение об успехе", function () {
    const body = pm.response.json();
    pm.expect(body).to.have.property("message");
    pm.expect(String(body.message).toLowerCase()).to.include("регистрац");
});

// --- Login 200 ---
pm.test("Логин: статус 200", () => pm.response.to.have.status(200));
pm.test("Логин: сохранить token", function () {
    const body = pm.response.json();
    const token = body.token || body.access_token || body.access;
    pm.expect(token, "token отсутствует в ответе").to.be.ok;
    pm.environment.set("token", token);
});

// --- Create God 200/201 ---
pm.test("Create: статус 200 или 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
pm.test("Create: category = gods + сохранить id", function () {
    const body = pm.response.json();
    const item = body.data || body;
    if (item.category) {
        pm.expect(item.category).to.eql("gods");
    }
    const id = item.id || body.id;
    if (id) {
        pm.environment.set("mythology_id", String(id));
    }
});

// --- Create God 400 ---
pm.test("Негатив Create: статус 400", () => pm.response.to.have.status(400));

// --- GET list ---
pm.test("Список: статус 200", () => pm.response.to.have.status(200));
pm.test("Список: тело — массив или объект с data[]", function () {
    const body = pm.response.json();
    const list = Array.isArray(body) ? body : body.data || body.results || body.items;
    pm.expect(list, "ожидался список").to.be.an("array");
});

// --- PATCH ---
pm.test("PATCH: статус 200", () => pm.response.to.have.status(200));

// --- DELETE ---
pm.test("DELETE: статус 200 или 204", function () {
    pm.expect([200, 204]).to.include(pm.response.code);
});
