from bs4 import BeautifulSoup
import json

# https://aggiemap.tamu.edu/directory/
with open('scripts/directory.html') as data:
	soup = BeautifulSoup(data)

# 208 buildings
buildings = {}
for item in soup.find_all('td'):
	# abbr = length of content in parens
	abbr_len = item.string.find(')') - item.string.find('(')
	if (abbr_len == 5):
		url_id = item.a.get('href')[7:]
		name = item.string[:item.string.find('(')-1]
		abbr = item.string[item.string.find('(')+1:len(item.string)-1]
		# if abbr.isalpha():
			# print(str(name)+str(abbr)+str(url_id))
		buildings[abbr] = { 'name': name, 'url_id': url_id }

# For locations.js
# with open('data.json', 'w') as outfile:
	# json.dump(buildings, outfile, sort_keys = True, indent = 2, ensure_ascii = True)

with open('languageModel.json') as data:
	language_model = json.load(data)

print(language_model["languageModel"]["types"][1])



# print(json.dumps(buildings['languageModel']['types'],indent=2,sort_keys=True))
# print(buildings['languageModel']['types'])