"use client";

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    // Fetch the OpenAPI specification
    fetch('/api/docs')
      .then(response => response.json())
      .then(data => setSpec(data))
      .catch(error => console.error('Error loading API docs:', error));
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ClimaBill Carbon Tracking API Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Explore and integrate with our comprehensive carbon tracking and management API
        </p>
      </div>
      
      {spec ? (
        <SwaggerUI spec={spec} />
      ) : (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
