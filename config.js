module.exports = {
    "SESSION_KEY": process.env["JL_SESSION_KEY"] || "session-key",
    "USER": "shivam.thakral@icloud.com",
    "PASS": "3449faaa-8818-4d3c-9737-4e9b67b7f85b",
    "EMAIL_ADDRESS": "no-reply@mail.joblana.com",
    "SECRET_KEY": process.env["JL_SECRET_KEY"] || "secret-key",
    "SESSION_COOKIE_SECURE": false,
    "SEND_EMAIL": true,
    "facebookAuth" : {
    	"clientID": process.env["JL_FB_CLIENT_ID"] ||  "app-id", // your App ID
        "clientSecret": process.env["JL_FB_CLIENT_SECRET"] ||  "client-id", // your App Secret
        "callbackURL": "http://localhost:8080/user/facebook/callback",
        "profileURL": "https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email",
        "profileFields" : ["id", "email", "name"] // For requesting permissions from Facebook API
    },
}