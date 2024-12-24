import * as authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        res.status(200).json({ success: true, token: result.token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const requestPasswordReset = async (req, res) => {
    try {
        await authService.requestPasswordReset(req.body.email);
        res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const showResetPasswordForm = async (req, res) => {
    try {
        const token = req.query.token;

        authService.validateResetToken(token);

        res.send(`
            <html>
                <head>
                    <title>Reset Password</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            max-width: 400px;
                            margin: 40px auto;
                            padding: 20px;
                        }
                        div {
                            margin-bottom: 15px;
                        }
                        input {
                            width: 100%;
                            padding: 8px;
                            margin-top: 5px;
                        }
                        button {
                            padding: 10px 15px;
                            background-color: #007bff;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                    </style>
                </head>
                <body>
                    <h2>Reset Your Password</h2>
                    <form action="/api/auth/reset-password" method="POST">
                        <input type="hidden" name="token" value="${token}" />
                        <div>
                            <label>New Password:</label>
                            <input type="password" name="newPassword" required />
                        </div>
                        <div>
                            <label>Confirm New Password:</label>
                            <input type="password" name="confirmPassword" required />
                        </div>
                        <button type="submit">Reset Password</button>
                    </form>
                </body>
            </html>
        `);
    } catch (error) {
        res.status(400).send(`
            <html>
                <body>
                    <h2>Error</h2>
                    <p>${error.message}</p>
                </body>
            </html>
        `);
    }
};

export const resetPassword = async (req, res) => {
    try {
        console.log('Incoming body:', req.body); // Debugging
        const { token, newPassword, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is missing' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        await authService.resetPassword(token, newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const verifyEmail = async (req, res) => {
    try {
        await authService.verifyEmail(req.query.token);
        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
