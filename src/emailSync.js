const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const mongoose = require('mongoose');
const Email = require('./models/Email');

mongoose.connect('mongodb://localhost:27017/emailDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const accounts = [
    {
        user: 'example1@gmail.com',
        password: 'app_password1',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
    },
    {
        user: 'example2@gmail.com',
        password: 'app_password2',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
    }
];

function getSinceDate() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0]; 
}

async function connectAccount(account) {
    const config = {
        imap: account,
        onError: err => console.log(err),
    };

    try {
        const connection = await imaps.connect(config);

        await connection.openBox('INBOX');

        const searchCriteria = [['SINCE', getSinceDate()]];
        const fetchOptions = { bodies: [''], markSeen: false };
        const messages = await connection.search(searchCriteria, fetchOptions);

        for (const item of messages) {
            const all = item.parts.find(part => part.which === '');
            const parsed = await simpleParser(all.body);

            try {
                await Email.updateOne(
                    { uid: item.attributes.uid, account: account.user },
                    {
                        uid: item.attributes.uid,
                        account: account.user,
                        from: parsed.from.text,
                        to: parsed.to.value.map(v => v.address),
                        subject: parsed.subject,
                        date: parsed.date,
                        body: parsed.text
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.log('Error saving email:', err);
            }
        }

        console.log(`Initial fetch done for ${account.user}`);

        connection.on('mail', async () => {
            console.log(`New mail detected for ${account.user}`);
            const newMessages = await connection.search([['SINCE', getSinceDate()]], fetchOptions);
            for (const item of newMessages) {
                const all = item.parts.find(part => part.which === '');
                const parsed = await simpleParser(all.body);
                try {
                    await Email.updateOne(
                        { uid: item.attributes.uid, account: account.user },
                        {
                            uid: item.attributes.uid,
                            account: account.user,
                            from: parsed.from.text,
                            to: parsed.to.value.map(v => v.address),
                            subject: parsed.subject,
                            date: parsed.date,
                            body: parsed.text
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log('Error saving new email:', err);
                }
            }
        });

    } catch (err) {
        console.log(`Connection failed for ${account.user}:`, err);
    }
}

accounts.forEach(account => connectAccount(account));
