# UrbanGo (InDrive Clone MVP)

Este proyecto es un sistema de movilidad tipo inDrive construido con Clean Architecture.

## Estructura del Proyecto

El proyecto está dividido estrictamente en dos partes:

- **frontend/**: Aplicación React + Vite + TailwindCSS.
- **backend/**: API REST con Node.js + Express + TypeScript + Prisma.

## Cómo Iniciar

### Backend

1.  Entra a la carpeta backend: `cd backend`
2.  Instala dependencias: `npm install`
3.  Configura variables de entorno en `.env`.
4.  Ejecuta migraciones: `npm run prisma:migrate`
5.  Inicia el servidor: `npm run dev`

### Frontend

1.  Entra a la carpeta frontend: `cd frontend`
2.  Instala dependencias: `npm install`
3.  Inicia el servidor de desarrollo: `npm run dev`

## Arquitectura

- **Backend**: Sigue Clean Architecture (Domain, Application, Infrastructure, Interface).
- **Frontend**: Componentes modulares y estado gestionado con Zustand.
