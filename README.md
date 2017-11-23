![Status](https://img.shields.io/badge/status-ok-green.svg) ![Maintenance](https://img.shields.io/maintenance/yes/2017.svg?maxAge=2592000) ![License](https://img.shields.io/dub/l/vibe-d.svg?maxAge=2592000)

# Webcams de Asturias

<b>Aplicación Web Progresiva (PWA) que muestra Imágenes de cámaras web situadas en el Principado de Asturias</b>

Este es un proyecto experimental que pone en práctica diversos patrones, arquitecturas y tecnologías en una
aplicación desarrollada con el framework AngularJS. Se ha creado con la intención de que sirva como referencia
para posteriores consultas del autor o de cualquier persona interesada en el tema. Cualquier comentario o
sugerencia puede ser formulada en la sección de "Issues".

## Características

- Arquitectura:
  - Business Layer diseñada en base a Programación Orientada a Objetos
  - Uso del Patrón MVC para separación de responsabilidades
  - Uso de "Route Resolvers"
  - Uso de una base de datos JSON ligera para mantener el estado en memoria (LokiDB, LowDB, etc). Debido a su simplicidad,
  en este caso el estado de la aplicaión consiste en una colección de objetos JSON en memoria con las consultas diseñadas
  ad hoc sin ninguna otra capa de abstracción intermedia. La persistencia en servidor se lleva a cabo mediante una
  base de datos NoSQL de Google Fusion Tables.
  - Uso de un "Service Worker" para ofrecer funcionalidad off-line (PWA)

  NOTA: las nuevas versiones de Angular utilizan una arquitectura basada en componentes en lugar del Patrón MVC.

- Referencias:
  - <a href="https://toddmotto.com/rethinking-angular-js-controllers/">Rethinking AngularJS Controllers</a>.
  - <a href="https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc">
    AngularJS Model Objects with JavaScript Classes</a>.
  - <a href="https://medium.com/opinionated-angularjs/advanced-routing-and-resolves-a2fcbf874a1c">
    AngularJS Advanced Routing and Resolvers</a>.

- Incluye un fichero "manifest.json" que habilita la instalación en el escritorio y emular la instalación de las apps móviles

## Demo

- <div><a href="http://mobt.me/XfKL" target="_blank">Simulador móvil</a></div>

- <div><a href="http://yagolopez.github.io/Webcams_de_Asturias/www/" target="_blank">Pantalla grande</a></div>

## Funcionalidad

Las cámaras están agrupadas según las siguientes categorías:

- Playas
- Poblaciones
- Puertos (marítimos)
- Montaña

Hay tres formas de visualizar las imágenes de las webcams:

- Listado
- Mosaico
- Mapa

También se pueden filtrar según distintos criterios:

- Por categoría
- Por concejo
- Búsqueda por cadena de texto

Como valor añadido se pueden consultar diversas informaciones, como la temperatura,
imágenes de satélite, y estadísticas de la base de datos, como:
agrupación de cámaras web por concejo, categoría, distribución geográfica, etc.

## Tecnologías empleadas

- Ionic Framework 1+ (Interfaz de usuario)
- AngularJS
- Base de Datos: Google Fusion Tables
- Intel Crosswalk Runtime (Compilación cruzada a Android e IOS)

---

<p><b><i>(English)</i></b></p>

<b>Progressive Web App (PWA) showing real time images from webcams located at the Principality of Asturias</b>

- This is an experimental project to put in practice several patterns, best practices and technologies using the
AngularJS framework. It has been created as reference for the author or anyone interested in this topic.
Feel free to send any comment or sugerence in the Issues section.

- Architecture and features:
    - Business Layer design based on Object Oriented Programming
    - Use of MVC Pattern for separation of concerns
    - Use of Route Resolvers
    - Use of a designed ad hoc and lightweight JSON in memory database.
    - Use of Service Worker to enable off-line capabilities (PWA)

    NOTE: Modern versions of Angular use a component-based architecture instead of MVC Pattern.

- Referencias:
  - <a href="https://toddmotto.com/rethinking-angular-js-controllers/">Rethinking AngularJS Controllers</a>).
  - <a href="https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc">
    AngularJS Model Objects with JavaScript Classes</a>).
  - <a href="https://medium.com/opinionated-angularjs/advanced-routing-and-resolves-a2fcbf874a1c">
    AngularJS Advanced Routing and Resolvers</a>).

<a href="#">Back to top</a>