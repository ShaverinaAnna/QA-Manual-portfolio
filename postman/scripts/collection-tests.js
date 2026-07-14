// Collection Tests — стандартный страховочный набор QA для каждого ответа

pm.test("Статус-код получен (ответ от сервера есть)", function () {
    pm.expect(pm.response.code).to.be.a("number");
    pm.expect(pm.response.code).to.be.within(100, 599);
});

pm.test("Время ответа < 2000 ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

const contentType = pm.response.headers.get("Content-Type") || "";
if (pm.response.code !== 204 && pm.response.text()) {
    pm.test("Content-Type указывает на JSON (если есть тело)", function () {
        pm.expect(contentType.toLowerCase()).to.include("application/json");
    });

    pm.test("Тело ответа — валидный JSON", function () {
        pm.response.to.be.json;
        pm.expect(() => pm.response.json()).to.not.throw();
    });
}

// Не падаем на 5xx молча — явная проверка «сервер жив для happy-path не обязательна,
// но 5xx всегда подсвечиваем как дефект инфраструктуры/API»
pm.test("Нет необработанной серверной ошибки 5xx", function () {
    pm.expect(pm.response.code, `5xx: ${pm.response.text()}`).to.be.below(500);
});
