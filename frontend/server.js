import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');

// Serve the built React files
app.use(express.static(dist));
app.use((req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(80, () => console.log('Frontend served on port 80'));