<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoachTech Pro - Smart Coaching Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #1e1e1e;
            --bg-secondary: #2d2d2d;
            --bg-tertiary: #3d3d3d;
            --accent-green: #47cf73;
            --accent-blue: #5ccfee;
            --accent-purple: #ae63e4;
            --text-primary: #ffffff;
            --text-secondary: #b4b4b4;
            --text-muted: #767676;
            --border-color: #404040;
            --shadow-dark: rgba(0, 0, 0, 0.5);
        }

        body {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Header - CodePen Style */
        header {
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .logo::before {
            content: '</>';
            color: var(--accent-blue);
            font-size: 1.2rem;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            border: 1px solid transparent;
        }

        .nav-links a:hover {
            color: var(--text-primary);
            border-color: var(--border-color);
            background: var(--bg-tertiary);
        }

        .cta-button {
            background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
            padding: 0.7rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            border: none;
            cursor: pointer;
            text-decoration: none;
            color: var(--bg-primary);
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(71, 207, 115, 0.3);
        }

        /* Hero Section - CodePen Editor Style */
        .hero {
            background: var(--bg-primary);
            padding: 120px 0 80px;
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23404040" stroke-width="0.5" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .hero-content {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }

        .hero-text h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-primary);
            line-height: 1.2;
        }

        .hero-text .highlight {
            color: var(--accent-green);
        }

        .hero-text p {
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.7;
        }

        .hero-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .btn {
            padding: 0.8rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            font-family: inherit;
            border: none;
            cursor: pointer;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
            color: var(--bg-primary);
        }

        .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px var(--shadow-dark);
        }

        /* Code Editor Mockup */
        .code-editor {
            background: var(--bg-secondary);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            overflow: hidden;
            box-shadow: 0 10px 40px var(--shadow-dark);
        }

        .editor-header {
            background: var(--bg-tertiary);
            padding: 0.8rem 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .editor-dots {
            display: flex;
            gap: 0.3rem;
        }

        .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .dot-red { background: #ff5f57; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #28ca42; }

        .editor-title {
            margin-left: 1rem;
            color: var(--text-secondary);
            font-size: 0.8rem;
        }

        .editor-content {
            padding: 1.5rem;
            font-family: 'SF Mono', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
        }

        .code-line {
            display: flex;
            margin-bottom: 0.3rem;
        }

        .line-number {
            color: var(--text-muted);
            margin-right: 1rem;
            user-select: none;
            min-width: 20px;
        }

        .code-content {
            flex: 1;
        }

        .keyword { color: var(--accent-purple); }
        .string { color: var(--accent-green); }
        .function { color: var(--accent-blue); }
        .comment { color: var(--text-muted); }

        /* Features Section */
        .features {
            padding: 80px 0;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
        }

        .section-title {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 3rem;
            color: var(--text-primary);
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .feature-card {
            background: var(--bg-primary);
            padding: 2rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-blue), var(--accent-purple));
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent-green);
            box-shadow: 0 15px 35px var(--shadow-dark);
        }

        .feature-card:hover::before {
            opacity: 1;
        }

        .feature-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .feature-card h3 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .feature-card p {
            color: var(--text-secondary);
            line-height: 1.6;
            font-size: 0.9rem;
        }

        /* Dashboard Preview */
        .dashboard-preview {
            padding: 80px 0;
            background: var(--bg-primary);
        }

        .dashboard-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }

        .dashboard-mockup {
            background: var(--bg-secondary);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            overflow: hidden;
            box-shadow: 0 20px 40px var(--shadow-dark);
        }

        .dashboard-tabs {
            background: var(--bg-tertiary);
            display: flex;
            border-bottom: 1px solid var(--border-color);
        }

        .tab {
            padding: 0.8rem 1.5rem;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 0.8rem;
            border-right: 1px solid var(--border-color);
        }

        .tab.active {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border-bottom: 2px solid var(--accent-green);
        }

        .dashboard-content {
            padding: 2rem;
        }

        .metric-card {
            background: var(--bg-tertiary);
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .metric-title {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-green);
        }

        .progress-bar {
            background: var(--bg-primary);
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 0.5rem;
        }

        .progress-fill {
            background: linear-gradient(90deg, var(--accent-green), var(--accent-blue));
            height: 100%;
            border-radius: 3px;
            transition: width 2s ease;
        }

        /* User Types */
        .user-types {
            padding: 80px 0;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
        }

        .user-types-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .user-type-card {
            background: var(--bg-primary);
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
            position: relative;
        }

        .user-type-card:hover {
            border-color: var(--accent-blue);
            transform: translateY(-5px);
            box-shadow: 0 15px 35px var(--shadow-dark);
        }

        .user-type-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .user-type-card h3 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .user-type-card p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Pricing Section */
        .pricing {
            padding: 80px 0;
            background: var(--bg-primary);
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .pricing-card {
            background: var(--bg-secondary);
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
            position: relative;
        }

        .pricing-card.featured {
            border-color: var(--accent-green);
            box-shadow: 0 15px 35px rgba(71, 207, 115, 0.2);
        }

        .pricing-card.featured::before {
            content: 'Most Popular';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
            color: var(--bg-primary);
            padding: 0.3rem 1rem;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
        }

        .pricing-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px var(--shadow-dark);
        }

        .price {
            font-size: 3rem;
            font-weight: 700;
            margin: 1rem 0;
            color: var(--accent-green);
        }

        .price span {
            font-size: 1rem;
            color: var(--text-secondary);
        }

        .pricing-features {
            text-align: left;
            margin: 2rem 0;
        }

        .pricing-features li {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            padding-left: 1rem;
            position: relative;
            font-size: 0.9rem;
        }

        .pricing-features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        /* Web App Section */
        .web-app {
            padding: 80px 0;
            background: var(--bg-secondary);
            text-align: center;
            border-top: 1px solid var(--border-color);
        }

        .app-preview {
            background: var(--bg-primary);
            border-radius: 12px;
            padding: 3rem;
            margin: 2rem 0;
            border: 1px solid var(--border-color);
            position: relative;
            overflow: hidden;
        }

        .app-preview::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 0%, rgba(71, 207, 115, 0.1) 100%);
        }

        .email-signup {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
            flex-wrap: wrap;
        }

        .email-input {
            padding: 0.8rem 1.2rem;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: var(--bg-tertiary);
            color: var(--text-primary);
            font-family: inherit;
            font-size: 0.9rem;
            min-width: 300px;
        }

        .email-input::placeholder {
            color: var(--text-muted);
        }

        .email-input:focus {
            outline: none;
            border-color: var(--accent-green);
            box-shadow: 0 0 0 3px rgba(71, 207, 115, 0.1);
        }

        /* Footer */
        footer {
            background: var(--bg-primary);
            border-top: 1px solid var(--border-color);
            padding: 60px 0 20px;
        }

        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .footer-section h3 {
            margin-bottom: 1rem;
            font-size: 1.1rem;
            color: var(--text-primary);
        }

        .footer-section a {
            color: var(--text-secondary);
            text-decoration: none;
            display: block;
            margin-bottom: 0.5rem;
            transition: color 0.3s ease;
            font-size: 0.9rem;
        }

        .footer-section a:hover {
            color: var(--accent-green);
        }

        .footer-bottom {
            border-top: 1px solid var(--border-color);
            padding-top: 2rem;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        /* Mobile Responsivity */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }

            .hero-content {
                grid-template-columns: 1fr;
                text-align: center;
            }

            .hero-text h1 {
                font-size: 2.2rem;
            }

            .dashboard-container {
                grid-template-columns: 1fr;
            }

            .email-signup {
                flex-direction: column;
                align-items: center;
            }

            .email-input {
                min-width: auto;
                width: 100%;
                max-width: 400px;
            }
        }

        /* Animations */
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease;
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .typing-animation {
            overflow: hidden;
            border-right: 2px solid var(--accent-green);
            animation: typing 3s steps(30, end), blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
        }

        @keyframes blink-caret {
            from, to { border-color: transparent; }
            50% { border-color: var(--accent-green); }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-primary);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--bg-tertiary);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--border-color);
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <nav class="container">
            <div class="logo">CoachTech Pro</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#users">Users</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <a href="#app" class="cta-button">Launch App</a>
        </nav>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1>Smart <span class="highlight">Coaching</span><br>Platform</h1>
                    <p>Build, manage, and optimize training programs with AI-powered insights. Offline-first platform connecting coaches, trainers, athletes, and parents in one unified ecosystem.</p>
                    <div class="hero-buttons">
                        <a href="#app" class="btn btn-primary">
                            <span>🚀</span> Launch Platform
                        </a>
                        <a href="#features" class="btn btn-secondary">
                            <span>📖</span> Documentation
                        </a>
                    </div>
                </div>
                <div class="code-editor">
                    <div class="editor-header">
                        <div class="editor-dots">
                            <div class="dot dot-red"></div>
                            <div class="dot dot-yellow"></div>
                            <div class="dot dot-green"></div>
                        </div>
                        <div class="editor-title">training-plan.js</div>
                    </div>
                    <div class="editor-content">
                        <div class="code-line">
                            <span class="line-number">1</span>
                            <div class="code-content">
                                <span class="keyword">const</span> <span class="function">generateTrainingPlan</span> = <span class="keyword">async</span> (athlete) => {
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">2</span>
                            <div class="code-content">
                                &nbsp;&nbsp;<span class="keyword">const</span> aiPlan = <span class="keyword">await</span> <span class="function">AI.analyze</span>(athlete.goals);
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">3</span>
                            <div class="code-content">
                                &nbsp;&nbsp;<span class="keyword">return</span> {
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">4</span>
                            <div class="code-content">
                                &nbsp;&nbsp;&nbsp;&nbsp;duration: <span class="string">'12 weeks'</span>,
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">5</span>
                            <div class="code-content">
                                &nbsp;&nbsp;&nbsp;&nbsp;sessions: aiPlan.<span class="function">optimize</span>(),
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">6</span>
                            <div class="code-content">
                                &nbsp;&nbsp;&nbsp;&nbsp;tracking: <span class="keyword">true</span>
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">7</span>
                            <div class="code-content">
                                &nbsp;&nbsp;};
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">8</span>
                            <div class="code-content">
                                };
                            </div>
                        </div>
                        <div class="code-line">
                            <span class="line-number">9</span>
                            <div class="code-content">
                                <span class="comment">// Auto-sync when offline</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
        <div class="container">
            <h2 class="section-title">Core Features</h2>
            <div class="features-grid">
                <div class="feature-card fade-in">
                    <div class="feature-icon">🤖</div>
                    <h3>AI Training Plans</h3>
                    <p>Machine learning algorithms generate personalized training programs based on athlete goals, performance history, and sport-specific requirements.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">📱</div>
                    <h3>Offline-First Architecture</h3>
                    <p>Progressive Web App design ensures full functionality without internet connection. Auto-sync when connectivity returns.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">📊</div>
                    <h3>Performance Analytics</h3>
                    <p>Real-time dashboards with advanced metrics, progress tracking, attendance logs, and comprehensive reporting system.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">🎥</div>
                    <h3>Video Integration</h3>
                    <p>Upload training videos, provide feedback, create drill libraries, and enable video-based form analysis and coaching.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">🥗</div>
                    <h3>Nutrition & Recovery</h3>
                    <p>Integrated meal planning, hydration tracking, sleep optimization, and recovery protocol recommendations.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">💳</div>
                    <h3>Payment Integration</h3>
                    <p>Secure payment processing for session bookings, academy enrollments, and trainer services with automated billing.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">👥</div>
                    <h3>Team Management</h3>
                    <p>Comprehensive tools for managing groups, teams, individual athletes with role-based permissions and communication.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">🏫</div>
                    <h3>Academy Discovery</h3>
                    <p>Location-based search for sports academies and training facilities with detailed profiles, reviews, and booking capabilities.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Dashboard Preview -->
    <section class="dashboard-preview">
        <div class="container">
            <div class="dashboard-container">
                <div class="dashboard-content">
                    <h2>Interactive Dashboard</h2>
                    <p>Real-time insights and comprehensive analytics designed for coaches, trainers, and athletes. Monitor progress, track performance, and optimize training effectiveness.</p>
                </div>
                <div class="dashboard-mockup">
                    <div class="dashboard-tabs">
                        <button class="tab active" onclick="switchTab(this, 'overview')">Overview</button>
                        <button class="tab" onclick="switchTab(this, 'analytics')">Analytics</button>
                        <button class="tab" onclick="switchTab(this, 'sessions')">Sessions</button>
                    </div>
                    <div class="dashboard-content" id="dashboard-content">
                        <div class="metric-card">
                            <div class="metric-header">
                                <span class="metric-title">Sessions This Week</span>
                                <span class="metric-value">42</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- User Types Section -->
    <section id="users" class="user-types">
        <div class="container">
            <h2 class="section-title">Built for Every User</h2>
            <div class="user-types-grid">
                <div class="user-type-card fade-in">
                    <div class="user-type-icon">👨‍🏫</div>
                    <h3>Coaches</h3>
                    <p>Create structured training plans, manage athlete progress, provide personalized feedback, and optimize team performance with advanced analytics.</p>
                </div>
                <div class="user-type-card fade-in">
                    <div class="user-type-icon">💪</div>
                    <h3>Fitness Trainers</h3>
                    <p>Design custom workout programs, track client progress, manage schedules, and grow your training business with integrated tools.</p>
                </div>
                <div class="user-type-card fade-in">
                    <div class="user-type-icon">🏃‍♂️</div>
                    <h3>Athletes</h3>
                    <p>Access personalized training plans, track performance metrics, communicate with coaches, and achieve your athletic goals efficiently.</p>
                </div>
                <div class="user-type-card fade-in">
                    <div class="user-type-icon">👨‍👩‍👧‍👦</div>
                    <h3>Parents</h3>
                    <p>Find quality academies for your children, monitor training progress, communicate with coaches, and support athletic development.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing">
        <div class="container">
            <h2 class="section-title">Choose Your Plan</h2>
            <div class="pricing-grid">
                <div class="pricing-card fade-in">
                    <h3>Individual</h3>
                    <div class="price">$9<span>/mo</span></div>
                    <ul class="pricing-features">
                        <li>Personal training plans</li>
                        <li>Progress tracking</li>
                        <li>Basic analytics</li>
                        <li>Mobile app access</li>
                        <li>Cloud sync</li>
                    </ul>
                    <a href="#app" class="btn btn-primary">Get Started</a>
                </div>
                <div class="pricing-card featured fade-in">
                    <h3>Coach Pro</h3>
                    <div class="price">$29<span>/mo</span></div>
                    <ul class="pricing-features">
                        <li>Unlimited athletes</li>
                        <li>AI training plans</li>
                        <li>Video integration</li>
                        <li>Team management</li>
                        <li>Payment processing</li>
                        <li>Advanced analytics</li>
                        <li>Priority support</li>
                    </ul>
                    <a href="#app" class="btn btn-primary">Start Free Trial</a>
                </div>
                <div class="pricing-card fade-in">
                    <h3>Academy</h3>
                    <div class="price">$99<span>/mo</span></div>
                    <ul class="pricing-features">
                        <li>Multiple coaches</li>
                        <li>Academy branding</li>
                        <li>Custom integrations</li>
                        <li>White-label solution</li>
                        <li>API access</li>
                        <li>Dedicated support</li>
                        <li>Training & onboarding</li>
                    </ul>
                    <a href="#contact" class="btn btn-primary">Contact Sales</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Web App Section -->
    <section id="app" class="web-app">
        <div class="container">
            <h2>Launch CoachTech Pro</h2>
            <p>Experience the full platform functionality in your browser</p>
            <div class="app-preview">
                <h3>🚀 Beta Access Available</h3>
                <p>Our comprehensive web application is ready for beta testing. Join our exclusive early access program and help shape the future of sports training technology.</p>
                <div class="email-signup">
                    <input type="email" class="email-input" placeholder="Enter your email for beta access" id="emailInput">
                    <button class="btn btn-primary" onclick="handleSignup()">
                        <span>✨</span> Request Access
                    </button>
                </div>
                <div style="margin-top: 2rem; font-size: 0.8rem; color: var(--text-muted);">
                    <p>🔒 We respect your privacy. No spam, ever.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>CoachTech Pro</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">Smart coaching platform revolutionizing sports training with AI-powered insights and comprehensive performance tracking.</p>
                </div>
                <div class="footer-section">
                    <h3>Platform</h3>
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#app">Web App</a>
                    <a href="#">API Documentation</a>
                    <a href="#">System Status</a>
                </div>
                <div class="footer-section">
                    <h3>Users</h3>
                    <a href="#users">For Coaches</a>
                    <a href="#users">For Trainers</a>
                    <a href="#users">For Athletes</a>
                    <a href="#users">For Parents</a>
                    <a href="#">Success Stories</a>
                </div>
                <div class="footer-section">
                    <h3>Support</h3>
                    <a href="mailto:support@coachtechpro.com">support@coachtechpro.com</a>
                    <a href="#">Help Center</a>
                    <a href="#">Community Forum</a>
                    <a href="#">Bug Reports</a>
                    <a href="#">Feature Requests</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 CoachTech Pro. All rights reserved. | <a href="#" style="color: var(--text-muted);">Privacy Policy</a> | <a href="#" style="color: var(--text-muted);">Terms of Service</a></p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Dashboard tab switching
        function switchTab(tab, tabName) {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update dashboard content based on tab
            const content = document.getElementById('dashboard-content');
            
            const contentMap = {
                overview: `
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Weekly Progress</span>
                            <span class="metric-value">87%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 87%;"></div>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Active Athletes</span>
                            <span class="metric-value">124</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Sessions This Week</span>
                            <span class="metric-value">42</span>
                        </div>
                    </div>
                `,
                analytics: `
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Performance Score</span>
                            <span class="metric-value">94.2</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 94%;"></div>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Improvement Rate</span>
                            <span class="metric-value">+23%</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Completion Rate</span>
                            <span class="metric-value">91%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 91%;"></div>
                        </div>
                    </div>
                `,
                sessions: `
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Today's Sessions</span>
                            <span class="metric-value">8</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Scheduled This Week</span>
                            <span class="metric-value">47</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Attendance Rate</span>
                            <span class="metric-value">96%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 96%;"></div>
                        </div>
                    </div>
                `
            };

            content.innerHTML = contentMap[tabName] || contentMap.overview;
            
            // Animate progress bars
            setTimeout(() => {
                document.querySelectorAll('.progress-fill').forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
            }, 50);
        }

        // Email signup handling
        function handleSignup() {
            const emailInput = document.getElementById('emailInput');
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!email) {
                showNotification('Please enter your email address.', 'error');
                emailInput.focus();
                return;
            }
            
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                emailInput.focus();
                return;
            }
            
            // Show loading state
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<span>⏳</span> Processing...';
            button.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                showNotification(`🎉 Success! We'll notify ${email} when beta access is available.`, 'success');
                emailInput.value = '';
                button.innerHTML = originalText;
                button.disabled = false;
                
                // Add success visual feedback
                emailInput.style.borderColor = 'var(--accent-green)';
                setTimeout(() => {
                    emailInput.style.borderColor = 'var(--border-color)';
                }, 3000);
            }, 2000);
        }

        // Notification system
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ff5f57' : type === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)'};
                color: var(--bg-primary);
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.9rem;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 10px 30px var(--shadow-dark);
                animation: slideIn 0.3s ease;
                max-width: 400px;
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 4000);
        }

        // Add CSS animations for notifications
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Enhanced keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any active states
                document.querySelectorAll('.active').forEach(el => {
                    if (!el.classList.contains('tab')) {
                        el.classList.remove('active');
                    }
                });
            }
            
            // Tab navigation for dashboard
            if (e.key === 'Tab' && e.target.classList.contains('tab')) {
                e.preventDefault();
                const tabs = Array.from(document.querySelectorAll('.tab'));
                const currentIndex = tabs.indexOf(e.target);
                const nextIndex = e.shiftKey ? 
                    (currentIndex - 1 + tabs.length) % tabs.length :
                    (currentIndex + 1) % tabs.length;
                tabs[nextIndex].focus();
            }
        });

        // Mobile menu functionality
        function initMobileMenu() {
            if (window.innerWidth <= 768) {
                const nav = document.querySelector('nav');
                const existingMenu = nav.querySelector('.mobile-menu-btn');
                
                if (!existingMenu) {
                    const menuButton = document.createElement('button');
                    menuButton.className = 'mobile-menu-btn';
                    menuButton.innerHTML = '☰';
                    menuButton.style.cssText = `
                        background: none;
                        border: none;
                        color: var(--text-primary);
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0.5rem;
                    `;
                    
                    nav.appendChild(menuButton);
                    
                    let mobileMenuOpen = false;
                    menuButton.addEventListener('click', function() {
                        const navLinks = document.querySelector('.nav-links');
                        if (!mobileMenuOpen) {
                            navLinks.style.display = 'flex';
                            navLinks.style.flexDirection = 'column';
                            navLinks.style.position = 'absolute';
                            navLinks.style.top = '100%';
                            navLinks.style.left = '0';
                            navLinks.style.width = '100%';
                            navLinks.style.background = 'var(--bg-secondary)';
                            navLinks.style.padding = '1rem';
                            navLinks.style.borderTop = '1px solid var(--border-color)';
                            menuButton.innerHTML = '✕';
                        } else {
                            navLinks.style.display = 'none';
                            menuButton.innerHTML = '☰';
                        }
                        mobileMenuOpen = !mobileMenuOpen;
                    });
                }
            }
        }

        // Initialize everything
        document.addEventListener('DOMContentLoaded', function() {
            initMobileMenu();
            
            // Add enter key support for email input
            document.getElementById('emailInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleSignup();
                }
            });
            
            // Animate progress bars on page load
            setTimeout(() => {
                document.querySelectorAll('.progress-fill').forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
            }, 1000);
        });

        // Window resize handler
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                const navLinks = document.querySelector('.nav-links');
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'row';
                navLinks.style.position = 'static';
                navLinks.style.background = 'transparent';
                navLinks.style.padding = '0';
                navLinks.style.borderTop = 'none';
                
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                if (mobileMenuBtn) {
                    mobileMenuBtn.remove();
                }
            } else {
                initMobileMenu();
            }
        });
    </script>
</body>
</html>-card">
                            <div class="metric-header">
                                <span class="metric-title">Weekly Progress</span>
                                <span class="metric-value">87%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 87%;"></div>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-header">
                                <span class="metric-title">Active Athletes</span>
                                <span class="metric-value">124</span>
                            </div>
                        </div>
                        <div class="metric