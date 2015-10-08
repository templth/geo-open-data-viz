# Overview

This project aims to provide support to create and manage your maps as a service. It
provides an abstraction upon the raw-level technologies to display maps on the Web.
With such approach, you don't need anymore the knowledge of these technologies.

The following figure provides the big picture of the project.

![Overview](map-dsl.png)

# Modules

## Map DSL

A complete DSL (Domain Specific Language) that allows to define the map and its content
without writing any line of code from D3.

See more details in the [DSL section](dsl.html) of the documentation.

## Web API

The Web API allows to configure maps, their layers and the used sources. It leverages the
map DSL for the exchanged formats.

This Web API can also contain data to display and link to maps.

## Web UI

The Web UI is the module that displays the configured maps.

## Code generator

Generate D3 JavaScript code according to configured maps.