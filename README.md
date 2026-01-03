# SkillFlow360 (Microservices) — Full Project

## Services & ports
- eureka-service : 8761
- gateway-service : 8888
- auth-service : 8087
- competence-service : 8080
- activites-service : 8082
- evaluation-service : 8083
- graphe-service : 8084
- recommendation-service : 8086

![WhatsApp Image 2026-01-03 at 12 55 32 PM](https://github.com/user-attachments/assets/ff9714d6-e5ef-461c-a051-2210ef1e395e)

## Objectif du projet :

SkillFlow360 est une plateforme pédagogique basée sur une architecture microservices, dont l’objectif est de :

- Gérer les compétences et sous-compétences
- Proposer des activités pédagogiques (TP, Quiz, Projets)
- Évaluer les étudiants à travers des QCM et activités notées
- Analyser les résultats pour suivre la progression
- Fournir des recommandations personnalisées aux étudiants

Le système vise à améliorer l’apprentissage personnalisé et à aider les enseignants à suivre les performances des étudiants de manière structurée et évolutive.

## Diagramme d'architecture : 

<img width="816" height="618" alt="image" src="https://github.com/user-attachments/assets/5e75d89d-51f7-451a-8456-9c60a9860e4d" />


## Architdcture Globale : 

| Microservice | Description |
|-------------|------------|
| Authentification | Gestion des utilisateurs, rôles (ADMIN / STUDENT) et JWT |
| Compétences | Gestion des compétences, sous-compétences, niveaux, prerequis et references|
| Activités | Gestion des activités pédagogiques (TP, Quiz, Projet) et ressources |
| Évaluation | Création des QCM, soumission des réponses et calcul des scores |
| Recommandation | Génération de recommandations personnalisées pour les étudiants |
| Graphe & Analyse | Visualisation des compétences, progression et dépendances |


#### - Authentication Microservice : 
##### Rôle :
- Authentification des utilisateurs
- Gestion des rôles ADMIN (Professeur) et STUDENT
- Génération et validation des JWT

##### Fonctionnalités :
- Inscription
- Connexion
- Gestion sécurisée des mots de passe
- Protection des microservices


#### - Competence Microservice :
##### Rôle :
- Gérer les compétences
- Gérer les sous-compétences
- Associer des niveaux (Beginner / Intermediate / Advanced)

##### Fonctionnalités :
- CRUD compétences
- CRUD sous-compétences
- Liaison avec les activités


#### - Activities Microservice : 
##### Rôle : 
- Gérer les activités pédagogiques

##### Types d’activités :
- TP
- Quiz
- Projet

##### Fonctionnalités :
- CRUD activités
- Association à une compétence
- Gestion des ressources (PDF, vidéo, liens)


#### - Evaluation Microservice : 
##### Rôle :
- Gérer les évaluations des étudiants

##### Fonctionnalités : 
- Création d’évaluations (QCM)
- Gestion des questions
- Soumission des réponses
- Calcul des scores
- Historique des résultats pour :
 Professeur
 Étudiant

##### Profils :
- Professeur : crée les évaluations et consulte les résultats
- Étudiant : passe les évaluations et consulte ses scores

#### - Recommendation Microservice (Rule-Based) :
##### Objectif :
Fournir des recommandations personnalisées aux étudiants sans utiliser de Machine Learning, mais à travers des règles métier explicites.

##### Données analysées :
- Niveau de compétence de l’étudiant
- Activités complétées
- Résultats d’évaluation
- Préférences technologiques
- Popularité des activités

##### Exemple de règles :
- Recommander des activités correspondant aux technologies préférées
- Adapter le niveau des activités au niveau de l’étudiant
- Proposer des activités non encore complétées
- Valoriser les activités populaires

#### - Graph & Analysis Microservice :
##### Rôle :
- Visualiser les performances
- Analyser la progression des étudiants

##### Fonctionnalités : 
- Graphiques de progression
- Analyse des scores par compétence
- Statistiques globales

## 🛠️ Technologies utilisées
#### Backend :
- Java 17/21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security + JWT
- Hibernate
- Eureka

#### Base de données :
- MySQL

#### Frontend :
- React.js
- Axios

#### Outils
- Postman
- Maven
- Git / GitHub
- Docker

#### Communication entre microservices :
- REST APIs
- JSON
- JWT pour la sécurité
  

### 🚀 Lancement du projet : 
##### Prérequis : 
- Java 17
- Maven
- MySQL
- Node.js (frontend)

##### Étapes générales : 
1. Lancer la base de données
2. Démarrer le Gateway et Eurika Services
3. Démarrer les autres microservices
4. Lancer le frontend React

### Rôles des utilisateurs : 

| Rôle | Description | Fonctionnalités principales |
|------|------------|-----------------------------|
| ADMIN (Professeur) | Responsable pédagogique et gestionnaire du contenu | Création et gestion des compétences, activités et évaluations, consultation des résultats des étudiants, Analyser la progression des étudiants|
| STUDENT (Étudiant) | Apprenant utilisant la plateforme | Consultation des compétences et activités, passage des évaluations, suivi des résultats et recommandations |


### 🎓 Contexte académique : 
Ce projet est réalisé dans le cadre d’un Master en Technologies Emergentes, et vise à démontrer la mise en œuvre pratique :
- d’une architecture microservices
- d’un système d’évaluation pédagogique
- d’un moteur de recommandation pédagogique basé sur des règles

### Démonstration Video : 
Lien vers la vidéo de démonstration de l'application sur Youtube :

https://www.youtube.com/watch?v=559mjWNWrEQ

### Auteurs / Encadrement : 
- Nom : Rania ZHIRI et Majeda BEN-LAGHFIRI 
- Encadrant : Mohamed Lachgar
- Établissement : École Normale Supérieure de Marrakech
- Module : Architecture Microservices : Conception, Déploiement et Orchestration
