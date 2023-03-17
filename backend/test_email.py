import requests

mailtrap_url = "https://send.api.mailtrap.io/api/send"

payload = "{\"from\":{\"email\":\"mailtrap@cheryl-jiang.com\",\"name\":\"Mailtrap Test\"},\"to\":[{\"email\":\"cheryl.zjiang@gmail.com\"}],\"subject\":\"You are awesome!\",\"text\":\"Congrats for sending test email with Mailtrap!\",\"category\":\"Integration Test\"}"
headers = {
  "Authorization": "",
  "Content-Type": "application/json"
}

response = requests.request("POST", mailtrap_url, headers=headers, data=payload)
print(response.text)

# import smtplib

# def smtplib_send():
#     sender = "Private Person <photomaster@cheryl-jiang.com>"
#     receiver = "A Test User <to@example.com>"

#     message = f"""\
# Subject: Hi Mailtrap
# To: {receiver}
# From: {sender}

# This is a test e-mail message."""

#     try:
#         with smtplib.SMTP("sandbox.smtp.mailtrap.io", 2525) as server:
#             server.login("cceaa5b31ffd1d", "1f9fd5996ea273")
#             server.sendmail(sender, receiver, message)
#     except Exception as e:
#         print(e)
        
#     return 'Sent'

# smtplib_send()