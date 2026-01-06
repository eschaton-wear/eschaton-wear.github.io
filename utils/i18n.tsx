'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'zh';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Hero
        'hero.headline.part1': 'Elevate your Brand with Pure',
        'hero.headline.part2': 'Intelligence',
        'hero.input.placeholder': 'Ask anything about your brand...',
        'hero.button.generate': 'Generate',
        'hero.mode.normal': 'Normal Mode',
        'hero.mode.portal': 'Portal Mode (Ultra)',

        // Features
        'feature.deep_reasoning.title': 'Deep Reasoning',
        'feature.deep_reasoning.desc': "Our proprietary engine doesn't just answer; it thinks. Recursive analysis simulates human logic paths.",
        'feature.global_context.title': 'Global Context',
        'feature.global_context.desc': 'Understanding markets across 140+ regions instantly. Cultural nuances are respected and leveraged.',
        'feature.real_time.title': 'Real-Time Synthesis',
        'feature.real_time.desc': "Live data ingestion means your brand strategy isn't static—it evolves with the market pulse.",

        // Trust
        'trust.pillar1': 'Léger AI',
        'trust.pillar2': '500+ Brands',
        'trust.pillar3': 'Fine-tune',

        // FAQ
        'faq.title': 'Questions',
        'faq.q1': 'How does the token system work?',
        'faq.a1': 'We use a tiered token system where every interaction costs a precise amount of tokens. You start with 1,500,000 tokens for free.',
        'faq.q2': 'What is included in the Ultra plan?',
        'faq.a2': 'The Ultra plan unlocks Portal Mode - our most advanced AI reasoning engine, priority processing speed, and exclusive access to beta features.',
        'faq.q3': 'What is Portal Mode?',
        'faq.a3': 'Portal Mode is powered by the most premium and powerful AI model available, delivering deep reasoning and exceptional brand intelligence insights.',
        'faq.q4': 'Is the analysis kept private?',
        'faq.a4': 'Absolutely. We do not use your data for training, and all conversations are processed with enterprise-grade encryption.',

        // Chat
        'chat.new_conversation': 'New Conversation',
        'chat.welcome_text': 'Choose your model below and start your first request.',
        'chat.thinking': 'Thinking...',
        'chat.placeholder': 'Keep exploring...',
        'chat.copy': 'Copy response',
        'chat.portal_locked': 'Portal Mode requires Ultra subscription',

        // AuthModal
        'auth.welcome_back': 'Welcome Back',
        'auth.create_account': 'Create Account',
        'auth.signin_desc': 'Sign in to access Léger AI',
        'auth.join_desc': 'Join Léger AI to unlock brand intelligence',
        'auth.email_placeholder': 'Email address',
        'auth.password_placeholder': 'Password',
        'auth.or': 'OR',
        'auth.continue_google': 'Continue with Google',
        'auth.no_account': "Don't have an account? ",
        'auth.has_account': "Already have an account? ",
        'auth.signup_link': 'Sign up',
        'auth.signin_link': 'Sign in',
        'auth.loading': 'Loading...',
        'auth.terms': 'Terms of Service',
        'auth.privacy': 'Privacy Policy',
        'auth.agree': 'By continuing, you agree to our',

        // UpgradeModal
        'upgrade.title': 'Upgrade to Continue',
        'upgrade.subtitle': "Choose a subscription plan to unlock Léger AI's full potential",
        'upgrade.recommended': 'RECOMMENDED',
        'upgrade.month': '/month',
        'upgrade.choose': 'Choose',
        'upgrade.plan.base.desc': 'Essential brand analysis for growing businesses.',
        'upgrade.plan.ultra.desc': 'Premium intelligence with Portal Mode capabilities.',
        'upgrade.features.base.0': 'Advanced AI analysis',
        'upgrade.features.base.1': 'Brand diagnostics',
        'upgrade.features.base.2': 'Standard response time',
        'upgrade.features.base.3': 'Email support',
        'upgrade.features.ultra.0': 'Portal Mode: Most powerful AI',
        'upgrade.features.ultra.1': 'Deep reasoning engine',
        'upgrade.features.ultra.2': 'Priority latency',
        'upgrade.features.ultra.3': 'Dedicated success manager',

        // Profile
        'profile.title': 'Profile Settings',
        'profile.logged_in_as': 'Logged in as',
        'profile.personal_info': 'Personal Info',
        'profile.email': 'Email Address',
        'profile.username': 'Username',
        'profile.save': 'Save',
        'profile.subscription': 'Subscription',
        'profile.current_plan': 'Current Plan',
        'profile.active': 'Active',
        'profile.upgrade_ultra': 'Upgrade to Ultra',
        'profile.renews_on': 'Renews on',
        'profile.free_plan': 'You are currently on the free Base plan.',
        'profile.session_mgmt': 'Session Management',
        'profile.logout': 'Log Out',
        'profile.logout_everywhere': 'Log Out Everywhere',
        'profile.logout_everywhere_confirm': 'Are you sure you want to sign out from all devices? You will need to log in again.',
        'profile.success_update': 'Profile updated successfully',
        'profile.fail_update': 'Failed to update profile',
        'profile.file_size': 'File size must be less than 5MB',
        'profile.upload_success': 'Avatar updated successfully',
        'profile.upload_fail': 'Failed to upload avatar',

        // Sidebar & General
        'general.pricing': 'Pricing',
        'general.signin': 'Sign In',
        'general.signout': 'Sign Out',
        'general.new_chat': 'New Chat',
        'general.create': 'Create',
        'general.cancel': 'Cancel',
        'general.chat_name': 'Chat name...',
        'general.no_history': 'No chat history yet.',
        'general.auto_save': 'Chats are saved automatically.',
        'general.delete_chat_title': 'Delete Chat',
        'general.delete_chat_msg': 'Are you sure you want to delete this chat history? This action cannot be undone.',
        'general.confirm_delete': 'Delete',
        'footer.text': 'Léger AI. Designed with pure intelligence.',

        // Auth / System
        'auth.welcome': 'Welcome',
        'system.error': "I'm sorry, I encountered an error.",
        'system.chat_created': "New chat created!",
        'system.chat_create_fail': "Failed to create new chat.",
        'system.load_fail': "Failed to load chat conversation.",
        'system.delete_fail': "Failed to delete chat.",
        'system.deleted': "Chat deleted.",
        'system.enter_message': "Please enter a message.",
    },
    ru: {
        // Hero
        'hero.headline.part1': 'Поднимите бренд с помощью',
        'hero.headline.part2': 'Интеллекта',
        'hero.input.placeholder': 'Спросите что угодно о вашем бренде...',
        'hero.button.generate': 'Создать',
        'hero.mode.normal': 'Обычный режим',
        'hero.mode.portal': 'Портал (Ultra)',

        // Features
        'feature.deep_reasoning.title': 'Глубокое мышление',
        'feature.deep_reasoning.desc': 'Наш движок не просто отвечает, он думает. Рекурсивный анализ имитирует пути человеческой логики.',
        'feature.global_context.title': 'Глобальный контекст',
        'feature.global_context.desc': 'Понимание рынков в 140+ регионах мгновенно. Культурные нюансы учитываются и используются.',
        'feature.real_time.title': 'Синтез в реальном времени',
        'feature.real_time.desc': 'Загрузка данных в реальном времени означает, что стратегия вашего бренда не статична — она развивается вместе с рынком.',

        // Trust
        'trust.pillar1': 'Léger AI',
        'trust.pillar2': '500+ Брендов',
        'trust.pillar3': 'Тонкая настройка',

        // FAQ
        'faq.title': 'Вопросы',
        'faq.q1': 'Как работает система токенов?',
        'faq.a1': 'Мы используем уровневую систему токенов, где каждое взаимодействие стоит определенное количество. Вы начинаете с 1 500 000 бесплатных токенов.',
        'faq.q2': 'Что включено в план Ultra?',
        'faq.a2': 'План Ultra разблокирует режим Портала - наш самый продвинутый движок ИИ, приоритетную скорость обработки и эксклюзивный доступ к бета-функциям.',
        'faq.q3': 'Что такое режим Портала?',
        'faq.a3': 'Режим Портала работает на самой мощной модели ИИ, обеспечивая глубокое мышление и исключительную аналитику бренда.',
        'faq.q4': 'Анализ конфиденциален?',
        'faq.a4': 'Абсолютно. Мы не используем ваши данные для обучения, и все разговоры обрабатываются с шифрованием корпоративного уровня.',

        // Chat
        'chat.new_conversation': 'Новый разговор',
        'chat.welcome_text': 'Выберите модель ниже и начните ваш первый запрос.',
        'chat.thinking': 'Думаю...',
        'chat.placeholder': 'Продолжайте изучать...',
        'chat.copy': 'Копировать ответ',
        'chat.portal_locked': 'Режим Портала требует подписку Ultra',

        // AuthModal
        'auth.welcome_back': 'С возвращением',
        'auth.create_account': 'Создать аккаунт',
        'auth.signin_desc': 'Войдите для доступа к Léger AI',
        'auth.join_desc': 'Присоединяйтесь к Léger AI для доступа к бренд-аналитике',
        'auth.email_placeholder': 'Адрес электронной почты',
        'auth.password_placeholder': 'Пароль',
        'auth.or': 'ИЛИ',
        'auth.continue_google': 'Продолжить через Google',
        'auth.no_account': "Нет аккаунта? ",
        'auth.has_account': "Уже есть аккаунт? ",
        'auth.signup_link': 'Зарегистрироваться',
        'auth.signin_link': 'Войти',
        'auth.loading': 'Загрузка...',
        'auth.terms': 'Условия обслуживания',
        'auth.privacy': 'Политика конфиденциальности',
        'auth.agree': 'Продолжая, вы соглашаетесь с наши',

        // UpgradeModal
        'upgrade.title': 'Обновите для продолжения',
        'upgrade.subtitle': "Выберите план подписки, чтобы раскрыть полный потенциал Léger AI",
        'upgrade.recommended': 'РЕКОМЕНДУЕМО',
        'upgrade.month': '/месяц',
        'upgrade.choose': 'Выбрать',
        'upgrade.plan.base.desc': 'Основной анализ бренда для растущего бизнеса.',
        'upgrade.plan.ultra.desc': 'Премиальная аналитика с возможностями режима Портала.',
        'upgrade.features.base.0': 'Продвинутый ИИ-анализ',
        'upgrade.features.base.1': 'Диагностика бренда',
        'upgrade.features.base.2': 'Стандартное время ответа',
        'upgrade.features.base.3': 'Email поддержка',
        'upgrade.features.ultra.0': 'Режим Портала: Самый мощный ИИ',
        'upgrade.features.ultra.1': 'Движок глубокого мышления',
        'upgrade.features.ultra.2': 'Приоритетная скорость',
        'upgrade.features.ultra.3': 'Персональный менеджер успеха',

        // Profile
        'profile.title': 'Настройки профиля',
        'profile.logged_in_as': 'Вы вошли как',
        'profile.personal_info': 'Личная информация',
        'profile.email': 'Email',
        'profile.username': 'Имя пользователя',
        'profile.save': 'Сохранить',
        'profile.subscription': 'Подписка',
        'profile.current_plan': 'Текущий план',
        'profile.active': 'Активен',
        'profile.upgrade_ultra': 'Обновить до Ultra',
        'profile.renews_on': 'Обновляется',
        'profile.free_plan': 'Вы сейчас на бесплатном плане Base.',
        'profile.session_mgmt': 'Управление сессиями',
        'profile.logout': 'Выйти',
        'profile.logout_everywhere': 'Выйти отовсюду',
        'profile.logout_everywhere_confirm': 'Вы уверены, что хотите выйти со всех устройств? Вам придется войти снова.',
        'profile.success_update': 'Профиль обновлен успешно',
        'profile.fail_update': 'Не удалось обновить профиль',
        'profile.file_size': 'Размер файла должен быть меньше 5МБ',
        'profile.upload_success': 'Аватар обновлен успешно',
        'profile.upload_fail': 'Не удалось загрузить аватар',

        // Sidebar & General
        'general.pricing': 'Цены',
        'general.signin': 'Войти',
        'general.signout': 'Выйти',
        'general.new_chat': 'Новый чат',
        'general.create': 'Создать',
        'general.cancel': 'Отмена',
        'general.chat_name': 'Название чата...',
        'general.no_history': 'История чатов пуста.',
        'general.auto_save': 'Чаты сохраняются автоматически.',
        'general.delete_chat_title': 'Удалить чат',
        'general.delete_chat_msg': 'Вы уверены, что хотите удалить историю этого чата? Это действие необратимо.',
        'general.confirm_delete': 'Удалить',
        'footer.text': 'Léger AI. Разработано с чистым интеллектом.',

        // Auth / System
        'auth.welcome': 'Добро пожаловать',
        'system.error': "Извините, произошла ошибка.",
        'system.chat_created': "Новый чат создан!",
        'system.chat_create_fail': "Не удалось создать новый чат.",
        'system.load_fail': "Не удалось загрузить переписку.",
        'system.delete_fail': "Не удалось удалить чат.",
        'system.deleted': "Чат удален.",
        'system.enter_message': "Пожалуйста, введите сообщение.",
    },
    zh: {
        // Hero
        'hero.headline.part1': '用纯净提升品牌',
        'hero.headline.part2': '智能',
        'hero.input.placeholder': '询问关于您品牌的任何问题...',
        'hero.button.generate': '生成',
        'hero.mode.normal': '普通模式',
        'hero.mode.portal': '传送门模式 (Ultra)',

        // Features
        'feature.deep_reasoning.title': '深度推理',
        'feature.deep_reasoning.desc': '我们的专有引擎不仅回答，还会思考。递归分析模拟人类逻辑路径。',
        'feature.global_context.title': '全球语境',
        'feature.global_context.desc': '瞬间理解140多个地区的市场。尊重并利用文化细微差别。',
        'feature.real_time.title': '实时合成',
        'feature.real_time.desc': '实时数据摄取意味着您的品牌策略不是静态的——它随市场脉搏而演变。',

        // Trust
        'trust.pillar1': 'Léger AI',
        'trust.pillar2': '500+ 品牌',
        'trust.pillar3': '微调',

        // FAQ
        'faq.title': '问题',
        'faq.q1': '代币系统如何运作？',
        'faq.a1': '我们使用分层代币系统，每次互动消耗精确数量的代币。也就是所谓的Token。您开始时有1,500,000个免费代币。',
        'faq.q2': 'Ultra计划包含什么？',
        'faq.a2': 'Ultra计划解锁传送门模式——我们最先进的AI推理引擎，优先处理速度以及独家访问测试功能。',
        'faq.q3': '什么是传送门模式？',
        'faq.a3': '传送门模式由最优质、最强大的AI模型驱动，提供深度推理和卓越的品牌情报洞察。',
        'faq.q4': '分析是私密的吗？',
        'faq.a4': '绝对的。我们不使用您的数据进行训练，所有对话都经过企业级加密处理。',

        // Chat
        'chat.new_conversation': '新对话',
        'chat.welcome_text': '在下方选择您的模型并开始您的第一次请求。',
        'chat.thinking': '思考中...',
        'chat.placeholder': '继续探索...',
        'chat.copy': '复制回复',
        'chat.portal_locked': '传送门模式需要Ultra订阅',

        // AuthModal
        'auth.welcome_back': '欢迎回来',
        'auth.create_account': '创建账户',
        'auth.signin_desc': '登录以访问 Léger AI',
        'auth.join_desc': '加入 Léger AI 解锁品牌情报',
        'auth.email_placeholder': '电子邮件地址',
        'auth.password_placeholder': '密码',
        'auth.or': '或',
        'auth.continue_google': '通过 Google 继续',
        'auth.no_account': "没有账户？",
        'auth.has_account': "已有账户？",
        'auth.signup_link': '注册',
        'auth.signin_link': '登录',
        'auth.loading': '加载中...',
        'auth.terms': '服务条款',
        'auth.privacy': '隐私政策',
        'auth.agree': '继续即表示您同意我们的',

        // UpgradeModal
        'upgrade.title': '升级以继续',
        'upgrade.subtitle': "选择订阅计划以解锁 Léger AI 的全部潜力",
        'upgrade.recommended': '推荐',
        'upgrade.month': '/月',
        'upgrade.choose': '选择',
        'upgrade.plan.base.desc': '为成长型企业提供的基本品牌分析。',
        'upgrade.plan.ultra.desc': '具有传送门模式能力的高级情报。',
        'upgrade.features.base.0': '高级AI分析',
        'upgrade.features.base.1': '品牌诊断',
        'upgrade.features.base.2': '标准响应时间',
        'upgrade.features.base.3': '电子邮件支持',
        'upgrade.features.ultra.0': '传送门模式：最强大的AI',
        'upgrade.features.ultra.1': '深度推理引擎',
        'upgrade.features.ultra.2': '优先延迟',
        'upgrade.features.ultra.3': '专属成功经理',

        // Profile
        'profile.title': '个人资料设置',
        'profile.logged_in_as': '登录身份',
        'profile.personal_info': '个人信息',
        'profile.email': '电子邮件',
        'profile.username': '用户名',
        'profile.save': '保存',
        'profile.subscription': '订阅',
        'profile.current_plan': '当前计划',
        'profile.active': '活跃',
        'profile.upgrade_ultra': '升级到 Ultra',
        'profile.renews_on': '续订日期',
        'profile.free_plan': '您当前处于免费的 Base 计划。',
        'profile.session_mgmt': '会话管理',
        'profile.logout': '退出登录',
        'profile.logout_everywhere': '退出所有设备',
        'profile.logout_everywhere_confirm': '您确定要退出所有设备吗？您需要重新登录。',
        'profile.success_update': '个人资料更新成功',
        'profile.fail_update': '更新个人资料失败',
        'profile.file_size': '文件大小必须小于 5MB',
        'profile.upload_success': '头像更新成功',
        'profile.upload_fail': '上传头像失败',

        // Sidebar & General
        'general.pricing': '定价',
        'general.signin': '登录',
        'general.signout': '退出',
        'general.new_chat': '新建聊天',
        'general.create': '创建',
        'general.cancel': '取消',
        'general.chat_name': '聊天名称...',
        'general.no_history': '暂无聊天记录。',
        'general.auto_save': '聊天自动保存。',
        'general.delete_chat_title': '删除聊天',
        'general.delete_chat_msg': '您确定要删除此聊天记录吗？此操作无法撤销。',
        'general.confirm_delete': '删除',
        'footer.text': 'Léger AI. 以纯粹智慧设计。',

        // Auth / System
        'auth.welcome': '欢迎',
        'system.error': "抱歉，我遇到了错误。",
        'system.chat_created': "新聊天已创建！",
        'system.chat_create_fail': "创建新聊天失败。",
        'system.load_fail': "加载聊天对话失败。",
        'system.delete_fail': "删除聊天失败。",
        'system.deleted': "聊天已删除。",
        'system.enter_message': "请输入消息。",
    }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        // Try to load from localStorage
        const saved = localStorage.getItem('leger-lang') as Language | null;
        if (saved && (saved === 'en' || saved === 'ru' || saved === 'zh')) {
            setLanguage(saved);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('leger-lang', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
