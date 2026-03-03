# Especificación de Requisitos del Producto (PRD) - Minijuego: El Equipo de Memoria (Boca Juniors)

## 1. Visión General
**Nombre del Proyecto:** El Equipo de Memoria Xeneize
**Objetivo:** Desarrollar un minijuego web interactivo enfocado exclusivamente en la historia de los planteles campeones del Club Atlético Boca Juniors. El objetivo del jugador es poner a prueba su memoria escribiendo la mayor cantidad de nombres de futbolistas que conformaron un equipo histórico específico dentro de un límite de tiempo.

## 2. Base de Datos (Estructura Estática)
El proyecto consumirá un único archivo JSON estático que representará la base de datos de los planteles. Debe ubicarse en el directorio de datos del proyecto.

### `equipos.json`
Array de objetos con formaciones/planteles históricos completos.
**Esquema:**
```json
{
  "campeonato": "string",
  "descripcion": "string",
  "equipo_completo": ["string"]
}
3. Mecánica del Juego
Dinámica principal:
Inicio de Partida: Al cargar, el juego selecciona un equipo al azar de equipos.json (ej: "Torneo Metropolitano 1981").
Interfaz de Juego: Se muestra en pantalla el campeonato, la descripcion a modo de pista, y una cuadrícula o lista de espacios en blanco (tarjetas ocultas). La cantidad de espacios corresponde exactamente a la longitud del array equipo_completo.
Ingreso de Datos: Hay un único campo de texto (input) donde el usuario puede escribir nombres o apellidos.
Validación y Aciertos: Cada vez que el usuario ingresa texto y presiona "Enter", el sistema verifica si pertenece a un jugador de la lista. Si es un acierto, la tarjeta correspondiente se voltea revelando el nombre completo del jugador y el input se limpia automáticamente.
Temporizador: El jugador tiene un reloj en cuenta regresiva de 3 minutos para adivinar la totalidad del plantel.
Condición de Fin de Juego: La partida termina cuando el usuario adivina a todos los jugadores (Victoria) o cuando el reloj llega a 00:00 (Derrota/Tiempo Agotado).
Resolución: Al finalizar, los espacios que quedaron en blanco se revelan resaltados (ej. en color rojo o deshabilitados) mostrando los jugadores que el usuario no logró recordar. Se ofrece un botón para jugar nuevamente con otro equipo al azar.
4. Diseño e Interfaz de Usuario (UI/UX)
¡IMPORTANTE! REGLA ESTRICTA DE COMPONENTES Y ESTILOS: No se debe inventar ninguna paleta de colores, tipografía, ni escribir estilos CSS o clases de frameworks utilitarios de forma manual. Es obligatorio seguir de manera férrea y estricta el Design System del proyecto. Toda la interfaz visual (modales, botones, inputs de texto, tarjetas de jugadores ocultas/reveladas, tipografías y el cronómetro) debe construirse invocando EXCLUSIVAMENTE los tokens y componentes ya definidos en el Design System actual del repositorio. Está estrictamente prohibido simular diseños propios.
5. Instrucciones Específicas para Claude Code (AI Developer)
Paso 1: Lee la estructura del proyecto y familiarízate profundamente con los componentes y tokens disponibles en el Design System.
Paso 2: Crea el archivo equipos.json en la carpeta correspondiente y avísame para que te pegue el contenido exacto de los planteles de Boca Juniors.
Paso 3: Implementa la vista principal del juego. Asegúrate de utilizar únicamente los componentes importados desde el Design System para armar la grilla de jugadores, el input de texto y la disposición general.
Paso 4 (CRÍTICO - Fuzzy String Matching): Implementa una lógica de normalización de cadenas sumamente robusta para el input del usuario. Debes:
Remover tildes y signos de puntuación.
Hacer validaciones sin distinguir mayúsculas de minúsculas (Case Insensitive).
Permitir la validación por apellido. Por ejemplo, si en el JSON figura "Diego Armando Maradona", el sistema debe darlo por válido si el usuario simplemente tipea "Maradona" o "diego maradona".
Paso 5: Implementa la lógica de estado para el reloj de cuenta regresiva y el cálculo de puntaje final (cantidad de jugadores adivinados sobre el total).