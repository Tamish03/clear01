import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your CLEAR verification code: {otp}</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Welcome to CLEAR. Use the code below to verify your account and start blurring unsafe content:
          </Text>
        </Row>
        <Row>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px' }}>
            {otp}
          </Text>
        </Row>
        <Row>
          <Text>If you did not request this, please ignore this email.</Text>
        </Row>
      </Section>
    </Html>
  );
}