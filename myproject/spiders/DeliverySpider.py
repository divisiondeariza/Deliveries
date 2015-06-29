# -*- coding: utf-8 -*-
from myproject.items import Restaurant
from scrapy.contrib.spiders.crawl import Rule, CrawlSpider
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from myproject.RestaurantSelector import RestaurantSelector

class DeliverySpider(CrawlSpider):
    name = "DeliverySpider"
    allowed_domains = ["domiciliosbogota.com"]
    start_urls = (
        'http://www.domiciliosbogota.com/',
    ) 
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
        return restaurant