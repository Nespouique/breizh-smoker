# Introduction
Tous les ans vers la période de Noël, on fait des fumaisons avec différents morceaux de viande/poissons.
L'idée est de faire un site qui permet de suivre le processus de fumaison, et de m'accompagner dans le processus de fumaison.
Il faut faire un site moderne et agréable à utiliser, avec un design responsive. Il faut pouvoir avoir une section par année, et pouvoir voir les morceaux de viande/poissons par année.

# Notes d'implémentation
Il faut utiliser des composants de l'univers shadcn, et permettre d'avoir une sorte de stepper pour suivre le processus de fumaison.
Si besoin d'icones, tu dois utiliser Lucid icons (par exemple pour les animaux pour les morceaux de viande/poissons).

Au niveau du parcours utilisateur : 
* Le point de départ doit être l'année, avec la possibilité d'ajouter une nouvelle année.
* Une fois dans l'année, il faut pouvoir ajouter des morceaux de viande/poissons.
* Il doit y avoir une section notes pour pouvoir faire des retours d'une année à l'autre (porté par l'objet année).
* Pour chaque morceau, il faut pouvoir ajouter des informations comme le type de viande/poisson, le morceau,le poids initial, le diamètre du morceau, pour que ça s'auto complète ensuite avec le poids final. On doit ensuite proposer au choix le mode de salaison, entre salaison sous vide et salaison traditionnelle. Selon le mode de salaison, on doit auto compléter le sel, le sucre, le poivre, et proposer des épices et des quantités, qui peuvent être modifiées par l'utilisateur. Enfin, on doit auto compléter le temps de salaison, le temps de fumaison, le temps d'affinage.

# Idées annexes / améliorations
* L'idéal serait de pouvoir notifier l'utilisateur par mail lorsqu'une nouvelle étape est attendue, ou de lui proposer d'ajouter à son calendrier une nouvelle tâche pour chaque étape.
* Si besoin d'illustrations, on pourra essayer d'utiliser nano banana.

# Notes sur le processus
Tu peux utiliser le fichier processus.md pour avoir le détail du processus et le reprendre dans le site. Tu peux également t'appuyer sur le fichier 2025.md pour avoir des notes sur les morceaux de viande/poissons et les étapes suivies pour l'année en cours, cela permettra de tester le site et de remplir ces éléments.

# Notes sur les MCP à utiliser et qui sont installés
- Shadcn pour pouvoir rechercher et utiliser des composants
- Lucid pour pouvoir rechercher et utiliser des icones