import { Box, Container } from "@mantine/core";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-gray-50">
      <Container size="xs" className="w-full py-8">
        {children}
      </Container>
    </Box>
  );
}
