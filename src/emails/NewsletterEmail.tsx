import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NewsletterEmailProps {
  email?: string;
}

export const NewsletterEmail = ({ email = '' }: NewsletterEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>¡Te has suscrito a las ofertas de IntiTech!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Bienvenido a IntiTech!</Heading>
          <Text style={text}>
            Hola,
          </Text>
          <Text style={text}>
            Gracias por suscribirte a nuestro boletín. A partir de ahora recibirás:
          </Text>
          <ul style={list}>
            <li style={listItem}>🎯 Últimas ofertas y descuentos exclusivos</li>
            <li style={listItem}>📦 Novedades en productos tech</li>
            <li style={listItem}>🏷️ Códigos de descuento especiales</li>
          </ul>
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={process.env.NEXT_PUBLIC_SITE_URL || 'https://intitech-development.vercel.app'}
            >
              Ver Ofertas Ahora
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Si no te suscribiste, puedes ignorar este mensaje.
            <br />
            El correo suscrito fue: {email}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1C274C',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 20px',
  padding: '0',
  lineHeight: '1.3',
};

const text = {
  color: '#1C274C',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const list = {
  paddingLeft: '20px',
  margin: '16px 0',
};

const listItem = {
  color: '#1C274C',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '8px',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};
