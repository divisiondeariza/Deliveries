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
    
    
class Dish(scrapy.Item):
    name = scrapy.Field()
    description = scrapy.Field()
    price = scrapy.Field()
    
class Product(scrapy.Item):
    product = scrapy.Field()
