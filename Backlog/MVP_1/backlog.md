## Duración: 3 semanas

## Objetivo

Tener un sistema donde usuarios reales puedan entrar y ver tareas, aunque aún no esten automátizadas.

# Sprint Backlog

# EPIC 1 ————————————————————

## HU-1: Creación de Usuarios

Como **administrador**, quiero **crear usuarios para los colaboradores del restaurante** para que **cada persona pueda acceder al sistema con su propia cuenta.**

### Criterios de Aceptación

- Se puede crear un usuario con nombre y rol.
- El usuario creado puede iniciar sesión.
- No se permiten usuarios duplicados.

## HU-2: Asignación de Roles

Como **administrador**, quiero **asignar un rol a cada usuario**, para **definir qué acciones puede realizar dentro del sistema.**

### Criterios de Aceptación

- Cada usuario tiene un solo rol activo.
- El rol determina qué vistas y acciones están disponibles.

## HU-3: Inicio de Sesión

Como **usuario,** quiero **iniciar sesión de manera sencilla y segura**, para **acceder rápidamente a mis tareas y responsabilidades.**

### Criterios de Aceptación

- El usuario puede autenticarse con credenciales válidas.
- Si las credenciales son incorrectas, el sistema lo informa.
- Al iniciar sesión se redirige según el rol.

## HU-4: Restricción de Acciones por Rol

Como **sistema**, quiero **restringir acciones según el rol de usuario**, para **evitar accesos indebidos y errores operativos.**

### Criterios de Aceptación

- Las acciones no permitidas no son visibles ni ejecutables.
- El sistema bloquea intentos no autorizados.

# EPIC 2 ————————————————————

## HU-8: Crear Tareas

Como **supervisor**, quiero **crear tareas**, para **definir cláramente qué actividades deben realizarse en el restaurante.**

### Criterios de Aceptación

- Se puede crear una tarea con nombre y descripción.
- La tarea queda disponible para asignación.
- La tarea no se asigna automáticamente al crearse.

## HU-9: Definir Prioridad de la Tarea

Como **supervisor**, quiero **definir la prioridad de una tarea**, para **asegurar que las tareas más importantes se atiendan primero.**

### Criterios de Aceptación

- Cada tarea tiene una prioridad (alta, media, baja).
- La prioridad es visible para el colaborador.
- La prioridad puede modificarse.

## HU-10: Definir Tiempo Estimado de la Tarea

Como **supervisor**, quiero **definir un tiempo estimado para una tarea**, para **facilitar la planificación y asignación del trabajo.**

### Criterios de Aceptación

- El tiempo estimado es opcional.
- Se define en minutos u horas.
- Es visible para supervisores y sistema.

## HU-13: Clasificar Tareas por Area

- El sistema puede filtrar tareas por área.

Como **supervisor**, quiero **asociar una tarea a un área del restaurante**, para **mejorar la organización del trabajo.**

### Criterios de Aceptación

- Toda tarea pertenece a un área.
- El área es visible para el colaborador.

## HU-15: Visualización de Tareas

Como **supervisor**, quiero **ver un listado claro de todas las tareas**, para **tener control y claridad operativa.**

### Criterios de Aceptación

- Se muestran tareas activas e inactivas.
- Se puede filtrar por área o prioridad.
- La vista es clara y ordenada.

# EPIC 4 ————————————————————

## HU-23: Visualización de Tareas Asignadas

Como **colaborador**, quiero **ver claramente las tareas que tengo asignadas**, para saber qué debo hacer durante mi jornada.

### Criterios de Aceptación

- El colaborador ve solo sus tareas.
- Las tareas están ordenadas por prioridad.
- Se muestra el área y el tiempo estimado.

## HU-24: Cambio de Estado de una Tarea

Como **colaborador**, quiero **actualizar el estado de una tarea**, para reflejar el progreso de mi trabajo.

### Criterios de Aceptación

- El colaborador puede cambiar el estado.
- El cambio es inmediato y visible.
- Solo el asignado puede modificar su tarea.
