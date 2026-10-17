# Звіт перевірки лабораторної роботи №6

**Проєкт:** Vue Lottery App  
**Гілка:** `feature/fsd`, створена від `feature/routing`  
**Дата перевірки:** 17.10.2026

## Підсумок

Основні завдання лабораторної виконані: застосунок перенесено на FSD-шари, розділено API та сервіси, додано Pinia, PrimeVue-обгортки, теми, FSD lint і Mermaid-діаграму. `npm run build`, `npm run lint` та `npm run lint:fsd` завершилися успішно.

Є уточнення щодо вимоги збереження стану: `pinia-plugin-persistedstate` підключений і використовується для теми, але сесія з токенами й далі зберігається наявними функціями `localStorage`. Це зберігає сумісність з авторизацією лабораторної №5, однак якщо умова вимагає саме persisted-state плагін для сесії, цю частину слід додатково узгодити з викладачем. Store користувачів плагіном не персиститься.

## Перевірка завдань

| Завдання | Що реалізовано і де | Статус |
|---|---|---|
| Створити окрему гілку для FSD-реалізації від гілки лабораторної №5 | Робота ведеться в `feature/fsd`; базовий коміт збігається з `feature/routing`. Етапи реалізації оформлені окремими комітами. | Виконано |
| Додати потрібні залежності | У [package.json](./package.json) і lock-файлі додані PrimeVue, тема Aura, PrimeIcons, `pinia-plugin-persistedstate`, `eslint-plugin-boundaries` та resolver TypeScript-аліасів. Використовується PrimeVue 4. | Виконано |
| Перебудувати проєкт за FSD | Код розкладено по `app`, `pages`, `widgets`, `features`, `entities`, `shared` у `src/`. Слайси експортують публічний API через `index.ts`; маршрути завантажують сторінки ліниво через ці точки входу. | Виконано |
| Відокремити доступ до даних за Repository/Service-підходом | Контракти CRUD розміщені в [interfaces.ts](./src/shared/api/interfaces.ts), спільний HTTP-клієнт — у [http-client.ts](./src/shared/api/http-client.ts), сервіси користувачів і сесії — у `src/entities/user/api/` та `src/entities/session/api/`. Реєстрацію сервісів централізовано в [services.ts](./src/app/providers/services.ts) через [ServiceProvider](./src/shared/api/service-provider.ts). | Виконано |
| Перенести глобальний стан у Pinia | Створені setup stores сесії, користувачів і теми: [session.store.ts](./src/entities/session/model/session.store.ts), [users.store.ts](./src/entities/user/model/users.store.ts), [theme.store.ts](./src/entities/theme/model/theme.store.ts). Pinia і persisted-state plugin реєструються в [main.ts](./src/app/main.ts). | Виконано, з нюансом persistence |
| Додати PrimeVue та власні обгортки компонентів | PrimeVue, Aura і ToastService налаштовуються в [ui.ts](./src/app/providers/ui.ts). Спільні обгортки кнопки, поля вводу, таблиці, діалогу підтвердження та Toast експортуються з [shared/ui/index.ts](./src/shared/ui/index.ts). | Виконано |
| Використати обгортки та форми в сторінках/widgets | Форма користувача і форма входу використовують `AppInput`/`AppButton`, VeeValidate та Yup. Сторінка списку користувачів використовує `UsersTable`, форми, діалог підтвердження та Toast; таблиця користувачів побудована на `AppTable`. Основні місця: [UserForm.vue](./src/features/user-form/ui/UserForm.vue), [LoginForm.vue](./src/features/auth/ui/LoginForm.vue), [UsersListPage.vue](./src/pages/users/ui/UsersListPage.vue), [UsersTable.vue](./src/widgets/users-table/ui/UsersTable.vue). | Виконано |
| Додати повідомлення про результат операцій | Успішні й невдалі операції на сторінці користувачів та авторизації виводять Toast; сервіс подій для сповіщень — [toast.ts](./src/shared/ui/toast.ts), відображення — [AppToast.vue](./src/shared/ui/AppToast/AppToast.vue). | Виконано |
| Додати перемикання світлої/темної теми | Перемикач розміщений у шапці — [AppNavigation.vue](./src/widgets/app-header/ui/AppNavigation.vue). Store змінює клас `app-dark`, persisted-state зберігає вибір теми; темні стилі — у [index.scss](./src/app/styles/index.scss). | Виконано |
| Налаштувати FSD lint та перевірку публічних API | [eslint.config.mjs](./eslint.config.mjs) задає допустимі залежності між шарами, забороняє імпорт приватних файлів слайсів і вимагає звертатися до них через `index.ts`. Команда `lint:fsd` визначена в [package.json](./package.json). | Виконано |
| Додати діаграму залежностей шарів до README | У [README.md](./README.md), розділі «Структура FSD», є Mermaid `flowchart`; стрілки показують, що верхні шари залежать від нижчих. | Виконано |
| Зберегти функціональність попередньої лабораторної | Залишені маршрути, авторизація DummyJSON, захищені сторінки користувачів, таблиця, пошук, пагінація, перегляд/редагування, створення/видалення користувачів і функціональність лотереї. DummyJSON імітує CRUD; сервер не зберігає ці зміни. | Виконано |

## Схема структури

```text
src/
├── app/       # запуск, layout-и, router, providers, загальні стилі
├── pages/     # сторінки маршрутів
├── widgets/   # складені блоки сторінок
├── features/  # дії користувача: auth, форми, реєстрація, пошук
├── entities/  # user, session, theme, lottery та їхні моделі/API
└── shared/    # HTTP, конфігурація, UI-компоненти й утиліти
```

## Перевірки

| Команда / перевірка | Результат |
|---|---|
| `npm run build` | Успішно: type-check і production build пройшли |
| `npm run lint` | Успішно, помилок ESLint немає |
| `npm run lint:fsd` | Успішно, порушень FSD-правил немає |
| Браузерна перевірка | Перевірені вхід, перехід на список користувачів і перемикання світлої/темної теми |
| Автоматизовані unit-тести | Окремої test-команди в `package.json` немає |

## Зауваження перед здачею

1. Поточне середовище має Node.js `v24.11.1`, а [package.json](./package.json) вимагає `^22.18.0 || >=24.12.0`. Команди збірки й lint пройшли, але для відтворюваного запуску рекомендовано встановити версію Node.js, що відповідає `engines`.
2. Sass/Bootstrap друкують попередження про застарілий синтаксис `@import`; вони не блокують збірку.
3. Гілка та коміти є локальними; push на GitHub не виконувався. GitHub Pages для `feature/fsd` окремо не перевірявся.
4. Вибір теми переживає перезавантаження через Pinia plugin. Авторизаційні токени й користувач сесії читаються/записуються вручну у `localStorage` через [session-storage.ts](./src/shared/config/session-storage.ts); стан користувачів у Pinia не налаштований на персистентність.

## Етапні коміти

```text
77e6a18 chore: add PrimeVue and FSD lint dependencies
ddde35c chore: update PrimeVue and FSD lint dependencies
67189fc feat: add shared repositories and service provider
b266de1 feat: add Pinia stores for session users and themes
dd52b60 feat: add PrimeVue UI wrappers and toast provider
776a5b1 feat: compose application with FSD pages and widgets
9e9a4d6 chore: enforce and document FSD boundaries
56a13ce style: normalize ESLint config line endings
```
