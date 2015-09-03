# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class Restaurant(scrapy.Item):
    url = scrapy.Field()
    name = scrapy.Field(serializer=unicode)
    deliveryTimeInMinutes = scrapy.Field()
    minOrderPrice = scrapy.Field()
    deliveryCost = scrapy.Field()
    payMethods = scrapy.Field()
    tagCategories = scrapy.Field()
    menu = scrapy.Field()
    averagePunctuation = scrapy.Field()
    quantityOfComments = scrapy.Field()
    id = scrapy.Field()
    
class RestaurantCsv(scrapy.Item):
    nombre = scrapy.Field()
    id = scrapy.Field()
    pedido_minimo = scrapy.Field()
    tiempo_de_entrega = scrapy.Field()   
    numero_categorias = scrapy.Field()
    promedio_productos_por_menu = scrapy.Field()
    total_productos = scrapy.Field()
    menor_precio = scrapy.Field()
    mayor_precio = scrapy.Field()
    mediana_precios = scrapy.Field()
    promedio_precios = scrapy.Field()
    numero_comentarios = scrapy.Field()
    puntuacion = scrapy.Field()
    costo_domicilio = scrapy.Field()
    acepta_efectivo = scrapy.Field()
    acepta_credito = scrapy.Field()
    acepta_debito = scrapy.Field()
    acepta_sodexo = scrapy.Field()
    posee_tags_buscados = scrapy.Field()
    
    
class Dish(scrapy.Item):
    name = scrapy.Field()
    description = scrapy.Field()
    price = scrapy.Field()
    
class Product(scrapy.Item):
    product = scrapy.Field()
    
class ProductCsv(scrapy.Item):
    restaurante = scrapy.Field()
    categoria_producto = scrapy.Field()
    nombre = scrapy.Field()
    descripcion = scrapy.Field()
    precio = scrapy.Field()
    comida_colombiana = scrapy.Field()
    comida_vegetariana = scrapy.Field()
    ensaladas = scrapy.Field()
    sanduches = scrapy.Field()
    sopas = scrapy.Field()
    comida_saludable = scrapy.Field()
    otros_tags = scrapy.Field()
    
class Locations(scrapy.Item):
    coordinates = scrapy.Field()
    restaurantIDs = scrapy.Field()
    
class LocationCsv(scrapy.Item):
    id_restaurante = scrapy.Field()
    nombre_restaurante =  scrapy.Field()
    latitud = scrapy.Field()
    longitud = scrapy.Field()
    
        
