import express from 'express';
require('dotenv').config();
import initWebRoute from './route/web'
import configViewEngine from './configs/viewEngine';
import initAPIRoute from './route/api';
import connectDB from './config/connectDB';
import cors from 'cors';
import bodyParser from 'body-parser';

var morgan = require('morgan')

const app = express();
// app.use(cors({ origin: false }));
var corsOptions = {
    origin: process.env.URL_REACT,
    // origin: "*",
    optionsSuccessStatus: 200,
    credentials: true// some legacy browsers (IE11, various SmartTVs) choke on 204
}


app.use(cors(corsOptions))
const port = process.env.PORT || 8000;

// app.use((req, res, next) => {
//     console.log(req.method)
//     next()
// })
// app.use(morgan('combined'))
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

configViewEngine(app);

initWebRoute(app);

initAPIRoute(app);

connectDB();
// handle 404 not found

app.use((req, res) => {
    return res.render('404.ejs')
})