# 🚀 ПромтМаркетплейс - Маркетплейс промтов для нейросетей

Простой маркетплейс, где каждый участник может размещать свои промты для нейросетей и бесплатно читать промты других участников.

## Функционал

- ✅ Регистрация и вход через email или Google
- ✅ Публикация промтов с названием, описанием и категорией
- ✅ Просмотр всех промтов от всех участников
- ✅ Поиск промтов по названию и описанию
- ✅ Фильтрация по категориям
- ✅ Копирование промтов в один клик
- ✅ Удаление своих промтов
- ✅ Адаптивный дизайн

## Технологии

- React 17
- Supabase (база данных + аутентификация)
- Tailwind CSS (стилизация)

## Настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Скопируйте URL и анонимный ключ из настроек проекта
3. Создайте файл `.env` в корне проекта:

```env
REACT_APP_SUPABASE_URL=ваш_supabase_url
REACT_APP_SUPABASE_ANON_KEY=ваш_anon_key
```

### 3. Создание таблицы в Supabase

Выполните следующий SQL запрос в SQL Editor вашего проекта Supabase:

```sql
-- Создание таблицы prompts
CREATE TABLE prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для ускорения поиска
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать все промты
CREATE POLICY "Все могут читать промты" 
    ON prompts FOR SELECT 
    USING (true);

-- Политика: только авторизованные пользователи могут создавать промты
CREATE POLICY "Только авторизованные могут создавать промты" 
    ON prompts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Политика: только автор может удалять свой промт
CREATE POLICY "Только автор может удалять промт" 
    ON prompts FOR DELETE 
    USING (auth.uid() = user_id);

-- Политика: только автор может обновлять свой промт
CREATE POLICY "Только автор может обновлять промт" 
    ON prompts FOR UPDATE 
    USING (auth.uid() = user_id);
```

### 4. Запуск приложения

```bash
npm start
```

Приложение откроется по адресу [http://localhost:3000](http://localhost:3000)

## Использование

1. **Регистрация**: Зарегистрируйтесь через email или Google
2. **Создание промта**: Заполните форму с названием, описанием и текстом промта
3. **Просмотр**: Все промты доступны всем пользователям бесплатно
4. **Поиск**: Используйте поиск и фильтры для нахождения нужных промтов
5. **Копирование**: Нажмите кнопку "Копировать" чтобы скопировать промт в буфер обмена

## Структура проекта

```
src/
├── components/
│   ├── PromptForm.jsx      # Форма создания промта
│   ├── PromptCard.jsx      # Карточка промта
│   └── SearchFilter.jsx    # Поиск и фильтры
├── pages/
│   ├── Auth.jsx            # Страница авторизации
│   └── Dashboard.jsx       # Основная страница
├── lib/
│   └── supabaseClient.js   # Клиент Supabase
├── styles/
│   └── Dashboard.css       # Стили
├── App.jsx                 # Главный компонент
└── index.js                # Точка входа
```

## Лицензия

MIT
