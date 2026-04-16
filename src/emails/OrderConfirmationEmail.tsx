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

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderConfirmationEmailProps {
  userName?: string;
  orderNumber?: string;
  orderDate?: string;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export const OrderConfirmationEmail = ({
  userName = 'Customer',
  orderNumber = '#12345',
  orderDate = new Date().toLocaleDateString(),
  items = [],
  subtotal = 0,
  shipping = 0,
  total = 0,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your IntiTech order {orderNumber} has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmed!</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Thank you for your order! We&apos;re getting your items ready and will notify you when they ship.
          </Text>

          <Section style={informationTable}>
            <Row>
              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>ORDER NUMBER</Text>
                <Text style={informationTableValue}>{orderNumber}</Text>
              </Column>
              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>ORDER DATE</Text>
                <Text style={informationTableValue}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Order Summary</Heading>

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
                <Text style={text}>Subtotal:</Text>
              </Column>
              <Column align="right" style={totalValue}>
                <Text style={text}>${subtotal.toFixed(2)}</Text>
              </Column>
            </Row>
            <Row>
              <Column align="right" style={totalLabel}>
                <Text style={text}>Shipping:</Text>
              </Column>
              <Column align="right" style={totalValue}>
                <Text style={text}>${shipping.toFixed(2)}</Text>
              </Column>
            </Row>
            <Row>
              <Column align="right" style={totalLabel}>
                <Text style={totalText}>Total:</Text>
              </Column>
              <Column align="right" style={totalValue}>
                <Text style={totalText}>${total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          {shippingAddress && (
            <>
              <Hr style={hr} />
              <Heading style={h2}>Shipping Address</Heading>
              <Text style={text}>
                {shippingAddress.street}
                <br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
              </Text>
            </>
          )}

          <Hr style={hr} />

          <Section style={buttonContainer}>
            <Button style={button} href={`https://intitech-development.vercel.app/orders/${orderNumber}`}>
              View Order Details
            </Button>
          </Section>

          <Text style={footer}>
            If you have any questions about your order, please{' '}
            <Link style={link} href="mailto:support@intitech.com">
              contact our support team
            </Link>
            .
          </Text>

          <Text style={footer}>
            Thanks for shopping with IntiTech!
            <br />
            The IntiTech Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

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

const informationTable = {
  borderCollapse: 'collapse' as const,
  borderSpacing: '0px',
  color: '#1C274C',
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  fontSize: '12px',
  padding: '20px',
  margin: '24px 0',
};

const informationTableColumn = {
  paddingRight: '40px',
};

const informationTableLabel = {
  color: '#8898aa',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  lineHeight: '16px',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
};

const informationTableValue = {
  color: '#1C274C',
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '24px',
  margin: '0',
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
  width: '80%',
};

const totalValue = {
  width: '20%',
};

const totalText = {
  color: '#1C274C',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '28px',
  margin: '16px 0 0',
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
