# Motus App

## Description 

Application permettant de jouer au motus. 

 ## Lancement de l'application
 
Aller dans le dossier motus
 
 ```
cd motus
 ```

Lancer l'application

```
sudo chmod ugo+rwx  data/redis/dump.rdb
docker-compose up --build
```
## Diagrammes de séquence


## Regle du jeu

Le but du jeu est de trouver un mot dont le nombre de lettre est donné tout en utilisant le moins d'essais possible. Après chaque essais, les lettres bien placées s'affichent en vert, 
les lettres mal placées mais appartenant au mot recherché s'affichent en orange et les lettres qui n'appartiennent pas au mot s'affichent en rouge. Le mot à trouver change chaque jour.

## Axes d'améliorations

