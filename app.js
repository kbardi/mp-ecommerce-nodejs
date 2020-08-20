var express = require('express');
var exphbs  = require('express-handlebars');
var mercadopago = require('mercadopago');

require('dotenv').config();
 
var app = express();

mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN,
    integrator_id: process.env.INTEGRATOR_ID,
});
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    const currentUrl = `${req.protocol}://${req.get('host')}/`;
    let preference = {
        items: [
            {
                id: '1234',
                picture_url: `${currentUrl}${req.query.img}`,
                title: req.query.title,
                description: 'Dispositivo móvil de Tienda e-commerce​',
                unit_price: Number(req.query.price),
                quantity: Number(req.query.unit),
                category_id: 'phones',
                currency_id: 'ARS',
            },
        ],
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_63274575@testuser.com",
            date_created: "2015-06-02T12:58:41.425-04:00",
            phone: {
                area_code: "11",
                number: 22223333,
            },
            // identification: {
            //     type: "DNI",
            //     number: "12345678"
            // },    
            address: {
                street_name: 'False',
                street_number: 123,
                zip_code: '1111',
            }
        },
        external_reference: process.env.EMAIL,
        back_urls: {
            success: `${currentUrl}success`,
            failure: `${currentUrl}failure`,
            pending: `${currentUrl}pending`,
        },
        auto_return: 'approved',
        payment_methods: {
            installments: 6,
            excluded_payment_methods: [
                {
                    id: 'amex',
                },
            ],
            excluded_payment_types: [
                {
                    id: 'atm',
                },
            ],
        },
    };
    mercadopago.preferences.create(preference)
        .then(function(response) {
            // Este valor reemplazará el string "<%= global.id %>" en tu HTML
            console.log(response.body);
            res.render('detail', {
                ...req.query,
                id: response.body.id,
                init_point: response.body.init_point,
            });
        }).catch(function(error){
            console.log(error);
        });
});

app.get('/success', function (req, res) {
    console.log(req);
    res.render('result', {
        data: Object.keys(req.query).map(key => ({ key, value: req.query[key] })),
        message: 'El pago se realizó exitosamente',
    });
});
app.get('/failure', function (req, res) {
    console.log(req);
    res.render('result', {
        data: Object.keys(req.query).map(key => ({ key, value: req.query[key] })),
        message: 'El pago ha sido rechazado',
    });
});
app.get('/pending', function (req, res) {
    console.log(req);
    res.render('result', {
        data: Object.keys(req.query).map(key => ({ key, value: req.query[key] })),
        message: 'Procesando el pago',
    });
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));
 
app.listen(3000);