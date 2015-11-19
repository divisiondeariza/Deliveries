# -*- coding: utf-8 -*-

# Scrapy settings for DeliverySpiderProject project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/en/latest/topics/settings.html
#

BOT_NAME = 'DeliverySpiderProject'

SPIDER_MODULES = ['DeliverySpiderProject.spiders']
NEWSPIDER_MODULE = 'DeliverySpiderProject.spiders'

# Crawl responsibly by identifying yourself (and your website) on the user-agent
#USER_AGENT = 'DeliverySpiderProject (+http://www.yourdomain.com)'

DOWNLOAD_HANDLERS = {'s3': None,}

ITEM_PIPELINES = {'DeliverySpiderProject.pipelines.SaveOrderedCsv': 300}