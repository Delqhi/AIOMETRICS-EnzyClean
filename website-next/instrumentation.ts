import { registerOTel } from "@vercel/otel";

export function register() {
  const serviceName = process.env.OTEL_SERVICE_NAME ?? process.env.npm_package_name ?? "aiometrics-website";
  const deploymentEnvironment = process.env.OTEL_DEPLOYMENT_ENV ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
  const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? process.env.npm_package_version ?? "0.0.0";

  registerOTel({
    serviceName,
    attributes: {
      "deployment.environment": deploymentEnvironment,
      "service.version": serviceVersion,
      "service.namespace": "AIOMETRICS"
    }
  });
}
