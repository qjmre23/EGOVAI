import { app } from './app.js';
import { config } from './config.js';

app.listen(config.PORT, () => {
  console.log(`eGovAI demo server ready at http://localhost:${config.PORT}`);
});
