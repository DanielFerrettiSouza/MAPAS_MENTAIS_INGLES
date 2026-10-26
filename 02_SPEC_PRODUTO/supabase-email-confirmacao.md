# E-mails do Supabase em duas línguas (português + espanhol)

Onde colar: Supabase → Authentication → Emails (Email Templates).
Cole o **Assunto** no campo "Subject" e o **HTML** no campo "Message body". Salve.

---

## 1. Confirm signup (confirmação de cadastro)

**Assunto:**

```
Confirme seu e-mail · Confirma tu correo — Mapas Falantes
```

**HTML:**

```html
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #18181b;">
  <h2 style="margin: 0 0 12px;">🔊 Mapas Falantes</h2>

  <p>Olá! Clique no botão abaixo para ativar sua conta.</p>
  <p style="color:#71717a; margin-top:-6px;">¡Hola! Haz clic en el botón de abajo para activar tu cuenta.</p>

  <p style="margin: 24px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background:#ec4899; color:#fff; padding:14px 26px; border-radius:10px; text-decoration:none; font-weight:bold; display:inline-block;">
      Ativar minha conta · Activar mi cuenta
    </a>
  </p>

  <p style="font-size:13px; color:#71717a;">
    Se você não criou uma conta, ignore este e-mail.<br>
    Si no creaste una cuenta, ignora este correo.
  </p>
</div>
```

---

## 2. Reset password (esqueci minha senha)

**Assunto:**

```
Crie uma nova senha · Crea una nueva contraseña — Mapas Falantes
```

**HTML:**

```html
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #18181b;">
  <h2 style="margin: 0 0 12px;">🔊 Mapas Falantes</h2>

  <p>Recebemos um pedido para trocar sua senha. Clique no botão para criar uma nova.</p>
  <p style="color:#71717a; margin-top:-6px;">Recibimos una solicitud para cambiar tu contraseña. Haz clic en el botón para crear una nueva.</p>

  <p style="margin: 24px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background:#ec4899; color:#fff; padding:14px 26px; border-radius:10px; text-decoration:none; font-weight:bold; display:inline-block;">
      Criar nova senha · Crear nueva contraseña
    </a>
  </p>

  <p style="font-size:13px; color:#71717a;">
    Se não foi você, ignore este e-mail: sua senha continua a mesma.<br>
    Si no fuiste tú, ignora este correo: tu contraseña sigue igual.
  </p>
</div>
```
