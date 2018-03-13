from bs4 import BeautifulSoup
import json

# https://aggiemap.tamu.edu/directory/
with open("scripts/directory.html") as data:
	soup = BeautifulSoup(data)

# 208 buildings
for item in soup.find_all('td'):
	# abbr = length of content in parens
	abbr_len = item.string.find(')') - item.string.find('(')
	if (abbr_len == 5):
		url_id = item.a.get('href')[7:]
		name = item.string[:item.string.find('(')]
		abbr = item.string[item.string.find('('):]
		i += 1
		print(str(name)+str(abbr)+str(url_id))
		

with open("scripts/to_load.json") as data:
	buildings = json.load(data)


# print(json.dumps(buildings["languageModel"]["types"],indent=2,sort_keys=True))
# print(buildings["languageModel"]["types"])