import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName?: string;
  verificationUrl?: string;
}

export const WelcomeEmail = ({ userName = 'there', verificationUrl }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to IntiTech - Your Tech Shopping Destination</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to IntiTech!</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Thanks for joining IntiTech, your one-stop destination for the latest tech products and electronics.
            We&apos;re excited to have you on board!
          </Text>

          {verificationUrl && (
            <Section style={buttonContainer}>
              <Text style={text}>
                Please verify your email address to get started:
              </Text>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={text}>
            Here&apos;s what you can do next:
          </Text>
          <ul style={list}>
            <li style={listItem}>Browse our latest tech products</li>
            <li style={listItem}>Add items to your wishlist</li>
            <li style={listItem}>Get exclusive deals and offers</li>
            <li style={listItem}>Track your orders</li>
          </ul>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions, feel free to{' '}
            <Link style={link} href="mailto:support@intitech.com">
              contact our support team
            </Link>
            .
          </Text>

          <Text style={footer}>
            Happy shopping!
            <br />
            The IntiTech Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#1C274C',
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

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};
