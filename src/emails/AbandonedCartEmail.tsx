import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface AbandonedCartEmailProps {
  userName?: string;
  items?: CartItem[];
  cartTotal?: number;
  checkoutUrl?: string;
}

export const AbandonedCartEmail = ({
  userName = 'there',
  items = [],
  cartTotal = 0,
  checkoutUrl = 'https://intitech-development.vercel.app/cart',
}: AbandonedCartEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You left some items in your cart - complete your purchase now!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Don&apos;t forget your items!</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We noticed you left some great tech products in your cart. They&apos;re still
            waiting for you! Complete your purchase before they&apos;re gone.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>Your Cart Items</Heading>

          {items.map((item, index) => (
            <Section key={index} style={productContainer}>
              <Row>
                <Column style={productImageColumn}>
                  {item.image && (
                    <Img
                      src={item.image}
                      alt={item.name}
                      style={productImage}
                    />
                  )}
                </Column>
                <Column style={productInfoColumn}>
                  <Text style={productTitle}>{item.name}</Text>
                  <Text style={productDescription}>Quantity: {item.quantity}</Text>
                </Column>
                <Column style={productPriceColumn}>
                  <Text style={productPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </Column>
              </Row>
            </Section>
          ))}

          <Hr style={hr} />

          <Section style={totalContainer}>
            <Row>
              <Column align="right" style={totalLabel}>
                <Text style={totalText}>Cart Total:</Text>
              </Column>
              <Column align="right" style={totalValue}>
                <Text style={totalText}>${cartTotal.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={checkoutUrl}>
              Complete Your Purchase
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            <strong>Why shop with IntiTech?</strong>
          </Text>
          <ul style={list}>
            <li style={listItem}>Free shipping on orders over $50</li>
            <li style={listItem}>30-day money-back guarantee</li>
            <li style={listItem}>Secure checkout</li>
            <li style={listItem}>Fast delivery</li>
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

          <Text style={smallText}>
            You received this email because you added items to your cart at IntiTech.
            If you didn&apos;t make this request, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AbandonedCartEmail;

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

const h2 = {
  color: '#1C274C',
  fontSize: '24px',
  fontWeight: '600',
  margin: '24px 0 16px',
  padding: '0',
};

const text = {
  color: '#1C274C',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const productContainer = {
  margin: '16px 0',
  padding: '16px 0',
  borderBottom: '1px solid #e6ebf1',
};

const productImageColumn = {
  width: '80px',
  paddingRight: '16px',
};

const productImage = {
  width: '80px',
  height: '80px',
  borderRadius: '8px',
  objectFit: 'cover' as const,
};

const productInfoColumn = {
  paddingRight: '16px',
};

const productPriceColumn = {
  width: '100px',
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const productTitle = {
  color: '#1C274C',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 4px',
};

const productDescription = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const productPrice = {
  color: '#1C274C',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0',
};

const totalContainer = {
  margin: '24px 0',
};

const totalLabel = {
  paddingRight: '16px',
  width: '70%',
};

const totalValue = {
  width: '30%',
};

const totalText = {
  color: '#1C274C',
  fontSize: '20px',
  fontWeight: '700',
  lineHeight: '28px',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
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

const smallText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '24px 0 0',
};
