'''
Created on 5/09/2015

@author: emmanuel
'''
from scrapy.exporters import CsvItemExporter

"""
The standard CSVItemExporter class does not pass the kwargs through to the
CSV writer, resulting in EXPORT_FIELDS and EXPORT_ENCODING being ignored
(EXPORT_EMPTY is not used by CSV).
"""

from scrapy.conf import settings

class CsvOrderedItemExporter(CsvItemExporter):
    
    def __init__(self, *args, **kwargs):
        kwargs['fields_to_export'] = kwargs['fields_to_export']
        kwargs['encoding'] = settings.get('EXPORT_ENCODING', 'utf-8')

        super(CsvOrderedItemExporter, self).__init__(*args, **kwargs)