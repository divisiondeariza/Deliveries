# -*- coding: utf-8 -*-
from myproject.items import Restaurant, Dish
from scrapy.contrib.spiders.crawl import Rule, CrawlSpider
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.selector.unified import Selector
import re

class DeliverySpider(CrawlSpider):
    name = "DeliverySpider"
    allowed_domains = ["domiciliosbogota.com"]
    start_urls = (
        'http://www.domiciliosbogota.com/',
    ) 
    rules = [Rule(SgmlLinkExtractor(allow=(r"http\:\/\/www\.domiciliosbogota\.com\/domicilios\-.*")), 'parseRestaurants')]
    
    def parseRestaurants(self, response):
        sel = Selector(response)
        restaurant = Restaurant()
        restaurant["url"] = response.url
        restaurant["name"] = sel.xpath('//h2/text()').extract()[0]
        restaurant["deliveryTimeInMinutes"] = self.getDeliveryTimeInMinutes(sel)
        restaurant["minOrderPrice"] = self.getMinOrderPeice(sel)
        restaurant["deliveryCost"] = self.getDeliveryCost(sel)
        restaurant["payMethods"] = []
        restaurant["menu"] = self.getCategories(sel)
        return restaurant
    

    def ExtractIntegerFromTag(self, selector, cssQuery):
        text = selector.css(cssQuery).extract()[0].replace(",", "")
        numberInText = re.findall(r'\d+', text)[0]
        number = int(numberInText)
        return number

    def getDeliveryTimeInMinutes(self, selector):
        cssQuery = '.info-extra .first .min-oder-view::text'
        return self.ExtractIntegerFromTag(selector, cssQuery)
    
    def getMinOrderPeice(self, selector):
        cssQuery = '.info-extra .second .min-oder-view::text'
        return self.ExtractIntegerFromTag(selector, cssQuery)
    
    def getDeliveryCost(self, selector):
        cssQuery = '.info-extra .third .funcion-view'
        return self.ExtractIntegerFromTag(selector, cssQuery)
    
    def getCategories(self, selector):
        cssNameQuery = '.menu-categories ul li'
        categorylist = selector.css(cssNameQuery)
        categories = {}
        for category in categorylist:
            categoryName = self.getCategoryName(category)
            categoryNumericID = self.ExtractIntegerFromTag(category, "::attr(id)")
            dishes = self.getDishesByCategoryID(selector, categoryNumericID)
            categories[categoryName] = dishes
        return categories
    
    def getCategoryName(self, category):
        return category.xpath("text()").extract()[0].strip()
       
    def getDishesByCategoryID(self, selector, numericID):
        cssQuery = "div #category-" + str(numericID) + " ul li"
        dishesContainer = selector.css(cssQuery)     
        return [Dish()] * len(dishesContainer.extract())
    