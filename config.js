module.exports = {
    "SESSION_KEY": process.env["JL_SESSION_KEY"] || "session-key",
    "USER": process.env["JL_EMAIL_USER"] || "email-user",
    "PASS": process.env["JL_EMAIL_PASS"] || "email-pass",
    "EMAIL_ADDRESS": "no-reply@mail.joblana.com",
    "SECRET_KEY": process.env["JL_SECRET_KEY"] || "secret-key",
    "SESSION_COOKIE_SECURE": false,
    "SEND_EMAIL": true,
    "REQ_PROTOCOL": process.env["JL_REQ_PROTOCOL"] || "http",
    "REQ_HOST": process.env["JL_REQ_HOST"] || "127.0.0.1",
    "facebookAuth" : {
    	"clientID": process.env["JL_FB_CLIENT_ID"] ||  "app-id", // your App ID
        "clientSecret": process.env["JL_FB_CLIENT_SECRET"] ||  "client-id", // your App Secret
        "callbackURL": "http://localhost:8080/user/facebook/callback",
        "profileURL": "https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email",
        "profileFields" : ["id", "email", "name"] // For requesting permissions from Facebook API
    },
    "instamojo": {
        "API_KEY": process.env["JL_INSTA_API_KEY"] || "",
        "AUTH_KEY": process.env["JL_INSTA_AUTH_KEY"] || "",
        "SALT_KEY": process.env["JL_INSTA_SALT_KEY"] || "",
    }
}