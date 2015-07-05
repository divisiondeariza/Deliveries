# -*- coding: utf-8 -*-
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.contrib.spiders.crawl import Rule, CrawlSpider
from DeliverySpiderProject.RestaurantSelector import RestaurantSelector
from DeliverySpiderProject.items import Restaurant, Product
from DeliverySpiderProject.ProductLinkGetter import ProductLinkGetter
from scrapy.http.request import Request
import json

class RestaurantSpider(CrawlSpider):
    name = "RestaurantSpider"
    allowed_domains = ["domiciliosbogota.com"]
    start_urls = (
        'http://www.domiciliosbogota.com/',
    ) 
    productLinkGetter = ProductLinkGetter()
    rules = [Rule(SgmlLinkExtractor(allow=(r"http\:\/\/www\.domiciliosbogota\.com\/domicilios\-.*")), 'parseRestaurants')]
    

    def parseRestaurants(self, response):
        sel = RestaurantSelector(response)
        restaurant = Restaurant()
        restaurant["url"]                   = response.url       
        restaurant["name"]                  = sel.getName()      
        restaurant["deliveryTimeInMinutes"] = sel.getDeliveryTimeInMinutes()
        restaurant["minOrderPrice"]         = sel.getMinOrderPrice()
        restaurant["deliveryCost"]          = sel.getDeliveryCost()
        restaurant["payMethods"]            = sel.getPayMethods()
        restaurant["menu"]                  = sel.getMenuCategories()
        restaurant["tagCategories"]         = sel.getTagCategories()
        restaurant["averagePunctuation"]    = sel.getAveragePunctuation()
        restaurant["quantityOfComments"]    = sel.getQuantityOfComments()
        return  restaurant

