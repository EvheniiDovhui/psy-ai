# Psy-AI Frontend

Frontend побудований на React + Vite і організований по feature-папках.

## Запуск

```bash
npm install
npm run dev
```

## Структура

```text
src/
	App.jsx
	main.jsx

	components/
		layout/
			Header.jsx
			Footer.jsx
		common/
			ResultsDisplay.jsx
			TestCard.jsx

	pages/
		home/
		auth/
		dashboard/
		tests/
		chat/
		profile/
		specialists/

	lib/
		config/
			api.js
		data/
			sachsLevy.js
			mockData.js
```

## API Конфіг

Файл `src/lib/config/api.js`:
- використовує `VITE_API_BASE_URL`
- fallback: `http://localhost:8000`

## Головні маршрути

- `/`
- `/auth`
- `/dashboard`
- `/specialists`
- `/chat`
- `/patient/:id`
- `/primary-interview`
- `/sentences`
- `/beck`
