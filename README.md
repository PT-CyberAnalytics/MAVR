# MAVR Calculator

Online version https://pt-cyberanalytics.github.io/MAVR/

**EN** | [RU](#ru)

---

## EN

### Mobile Application Vulnerability Ranking (MAVR) Methodology

Mobile Application Vulnerability Ranking (MAVR) is a system for assessing the criticality of vulnerabilities in the client-side of mobile applications.

The system produces a numeric score from **0.0 to 10.0** and a corresponding severity level. Every assessment is described by a vector string in the format:

```
MAVR:1.0/AS:x/AR:x/UI:x/C:x/I:x/A:x[/OS:x][/CF:x]
```

#### Severity Levels

| Score      | Level    |
| ---------- | -------- |
| 0.0        | None     |
| 0.1 – 4.9  | Low      |
| 5.0 – 6.9  | Medium   |
| 7.0 – 8.9  | High     |
| 9.0 – 10.0 | Critical |

#### Features

- Interactive metric selection with instant score calculation
- Vector string input — paste any vector string to populate all metrics automatically
- Shareable links via URL hash (`#MAVR:1.0/AS:R/...`)
- EN / RU interface
- Description page with full methodology reference
- Scored examples

#### Running Locally

The site is fully static. Serve from any HTTP server — required for ES module imports and `fetch()` of language files:

```bash
# Python
python3 -m http.server 1337

# Node
npx serve .
```

Then open `http://localhost:1337`.

---

<a name="ru"></a>

## RU

### Методология MAVR

Mobile Application Vulnerability Ranking (MAVR) — система оценки критичности уязвимостей клиентской части мобильных приложений.

Система формирует числовую оценку от **0.0 до 10.0** и соответствующий уровень критичности. Каждая оценка описывается векторной строкой в формате:

```
MAVR:1.0/AS:x/AR:x/UI:x/C:x/I:x/A:x[/OS:x][/CF:x]
```

#### Уровни критичности

| Оценка     | Уровень     |
| ---------- | ----------- |
| 0.0        | Отсутствует |
| 0.1 – 4.9  | Низкий      |
| 5.0 – 6.9  | Средний     |
| 7.0 – 8.9  | Высокий     |
| 9.0 – 10.0 | Критический |

#### Возможности

- Интерактивный выбор метрик с мгновенным расчётом оценки
- Ввод векторной строки — вставьте вектор для автоматического заполнения метрик
- Ссылки для совместного использования через хэш URL (`#MAVR:1.0/AS:R/...`)
- Интерфейс на русском и английском языках
- Страница описания с полным справочником методологии
- Примеры оцененных уязвимостей

#### Локальный запуск

Сайт полностью статический. Запустите любой HTTP-сервер — он необходим для ES-модулей и `fetch()` языковых файлов:

```bash
# Python
python3 -m http.server 1337

# Node
npx serve .
```

Откройте `http://localhost:1337`.
