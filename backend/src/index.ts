import express from 'express';
import { log } from './log/logger';
import { requestLog } from './middleware/requestLog';
import { helloRouter } from './routes/hello';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(requestLog);

app.use('/api', helloRouter);

app.listen(PORT, () => {
  log.info('server', `后端已启动：http://localhost:${PORT}`);
});
