# Motus App

## Description 

Application permettant de jouer au motus. Jeu programmé en Javascript avec Node.js et Express.js.

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

### Authentification

```mermaid
sequenceDiagram
    Client ->> Motus serveur: /
    Note right of Motus serveur: Si l'utilisateur n'est pas connecté
    Motus serveur ->> Oauth serveur: /authorize
    Oauth serveur ->> Oauth serveur: Vérifie les paramètres OpenID
    Note left of Oauth serveur: Si les paramètres sont bons
    Oauth serveur->>Client: login.html
    Client ->> Oauth serveur: /check-login
    Oauth serveur ->> Oauth serveur: Vérifie l'authentification
    Note left of Oauth serveur: Si l'authentification est bonne
    Oauth serveur ->> Oauth serveur: Crée le code
    Oauth serveur ->> Motus serveur : /callback?code
    Motus serveur ->> Oauth serveur: /token?code
    Oauth serveur -->> Motus serveur: return idToken
    Motus serveur ->> Motus serveur: req.session.user = decodedToken
    Motus serveur ->> Client: /index.html
```


## Regle du jeu

Le but du jeu est de trouver un mot dont le nombre de lettre est donné tout en utilisant le moins d'essais possible. Après chaque essais, les lettres bien placées s'affichent en vert, 
les lettres mal placées mais appartenant au mot recherché s'affichent en orange et les lettres qui n'appartiennent pas au mot s'affichent en rouge. Le mot à trouver change chaque jour.

## Axes d'améliorations

