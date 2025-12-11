import app from './app.js';
import env from './config/env.js';

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Monolith server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
