import app from './app';
import { PORT } from './shared/config/env';

app.listen(PORT, () => {
  console.log(`[Server] Backend running on port ${PORT}`);
});
