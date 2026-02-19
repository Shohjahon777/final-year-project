import path from 'path'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import ejs from 'ejs'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const APP_NAME = process.env.APP_NAME || 'Faculty Evaluation System'
const MAIL_FROM = process.env.MAIL_FROM || 'noreply@example.com'
const year = new Date().getFullYear()

const templatesDir = path.join(process.cwd(), 'src', 'emails', 'templates')

function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    return null
  }
  return nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })
}

async function renderTemplate(name: string, data: Record<string, unknown>): Promise<string> {
  const filePath = path.join(templatesDir, `${name}.ejs`)
  return ejs.renderFile(filePath, {
    appName: APP_NAME,
    frontendUrl: FRONTEND_URL,
    year,
    ...data,
  })
}

export interface WelcomeData {
  firstName: string
  lastName?: string
  loginUrl: string
}

export async function sendWelcome(to: string, data: WelcomeData): Promise<void> {
  const html = await renderTemplate('welcome', {
    firstName: data.firstName,
    lastName: data.lastName,
    loginUrl: data.loginUrl,
  })
  const transport = getTransport()
  if (!transport) {
    console.warn('Email not sent (SMTP not configured): welcome to', to)
    return
  }
  await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject: `Welcome to ${APP_NAME}`,
    html,
  })
}

export interface ResetPasswordData {
  resetLink: string
  expiresIn: string
}

export async function sendResetPassword(to: string, data: ResetPasswordData): Promise<void> {
  const html = await renderTemplate('reset', {
    resetLink: data.resetLink,
    expiresIn: data.expiresIn,
  })
  const transport = getTransport()
  if (!transport) {
    console.warn('Email not sent (SMTP not configured): reset password to', to)
    return
  }
  await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject: `Reset your password – ${APP_NAME}`,
    html,
  })
}

export interface WarningData {
  subject?: string
  message?: string
  userName?: string
  actionUrl?: string
}

export async function sendWarning(to: string, data: WarningData = {}): Promise<void> {
  const html = await renderTemplate('warning', {
    subject: data.subject,
    message: data.message,
    userName: data.userName,
    actionUrl: data.actionUrl,
  })
  const transport = getTransport()
  if (!transport) {
    console.warn('Email not sent (SMTP not configured): warning to', to)
    return
  }
  await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject: data.subject || `Warning – ${APP_NAME}`,
    html,
  })
}

export interface AlertData {
  subject?: string
  message?: string
  userName?: string
  actionUrl?: string
}

export async function sendAlert(to: string, data: AlertData = {}): Promise<void> {
  const html = await renderTemplate('alert', {
    subject: data.subject,
    message: data.message,
    userName: data.userName,
    actionUrl: data.actionUrl,
  })
  const transport = getTransport()
  if (!transport) {
    console.warn('Email not sent (SMTP not configured): alert to', to)
    return
  }
  await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject: data.subject || `Alert – ${APP_NAME}`,
    html,
  })
}

export interface OAuthData {
  subject?: string
  message?: string
  userName?: string
  provider?: string
  loginUrl?: string
}

export async function sendOAuth(to: string, data: OAuthData = {}): Promise<void> {
  const html = await renderTemplate('oauth', {
    subject: data.subject,
    message: data.message,
    userName: data.userName,
    provider: data.provider,
    loginUrl: data.loginUrl || `${FRONTEND_URL}/login`,
  })
  const transport = getTransport()
  if (!transport) {
    console.warn('Email not sent (SMTP not configured): oauth to', to)
    return
  }
  await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject: data.subject || `Account linked – ${APP_NAME}`,
    html,
  })
}
