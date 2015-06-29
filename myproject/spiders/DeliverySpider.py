# -*- coding: utf-8 -*-
from myproject.items import Restaurant, Dish
from scrapy.contrib.spiders.crawl import Rule, CrawlSpider
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.selector.unified import Selector
import re
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
        restaurant["name"] = sel.getName()      
        restaurant["url"] = response.url
        restaurant["deliveryTimeInMinutes"] = self.getDeliveryTimeInMinutes(sel)
        restaurant["minOrderPrice"] = self.getMinOrderPeice(sel)
        restaurant["deliveryCost"] = self.getDeliveryCost(sel)
        restaurant["payMethods"] = self.getPayMethods(sel)
        restaurant["menu"] = self.getCategories(sel)
        restaurant["tagCategories"] = self.getTagCategories(sel)
        restaurant["averagePunctuation"] = self.getAveragePunctuation(sel)
        restaurant["quantityOfComments"] = self.getQuantityOfComments(sel)
        return restaurant
    
    def getQuantityOfComments(self, selector):
        cssQuery = ".restaurant-info .suggest-rating .link-comentarios::text"
        return self.ExtractIntegerFromTag(selector, cssQuery)
    
    def getAveragePunctuation(self, selector):
        cssQuery = ".rating .rated::attr(class)"
        return self.ExtractIntegerFromTag(selector, cssQuery)
        
    def getTagCategories(self, selector):
        return selector.css(".restaurant-header a::text").extract()
    
    def getPayMethods(self, selector):
        return selector.css(".tipos_pago div::attr(title)").extract()


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
        categories = []
        for category in categorylist:
            categoryName = self.getCategoryName(category)
            categoryNumericID = self.ExtractIntegerFromTag(category, "::attr(id)")
            dishes = self.getDishesByCategoryID(selector, categoryNumericID)
            categories.append({"name" : categoryName, "dishes":dishes})
        return categories
    
    def ExtractIntegerFromTag(self, selector, cssQuery):
        text = selector.css(cssQuery).extract()[0].replace(",", "")
        if(re.search(r'\d+', text) is not None):
            numericString = re.findall(r'\d+', text)[0]
            return int(numericString)
        return 0  
    
    def getCategoryName(self, category):
        return category.xpath("text()").extract()[0].strip()

    def getDishesByCategoryID(self, selector, numericID):
        cssQuery = "div #category-" + str(numericID) + " ul li"
        dishesContainer = selector.css(cssQuery)     
        return [self.createDish(dishData) for dishData in dishesContainer]
    
    def createDish(self, dishData):
        dish = Dish()
        dish["name"] = dishData.css(".title::text").extract()[0]
        dish["description"] = self.getElementInDishIfExists(dishData, ".description::text")
        dish["price"] = float(dishData.css(".price::attr(itemprice)").extract()[0])
        return dish  
      
    def getElementInDishIfExists(self, dishData, cssQuery):
        queryResults = dishData.css(cssQuery).extract()
        if (len(queryResults) > 0):
            return queryResults[0]
        return None   
    
    