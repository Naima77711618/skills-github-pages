import os
import json
import time
import requests
from google.transit import gtfs_realtime_pb2

# Chemin du fichier JSON
output_file = r"Y:\tam_alertes\data\alertes.json"

def convert_timestamp(timestamp):
    if timestamp == 0:
        return "Non spécifié"
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(timestamp))

def fetch_alertes():
    data_url = "https://data.montpellier3m.fr/TAM_MMM_GTFSRT/Alert.pb"

    try:
        response = requests.get(data_url)
        response.raise_for_status()

        feed = gtfs_realtime_pb2.FeedMessage()
        feed.ParseFromString(response.content)

        alertes_list = []
        for entity in feed.entity:
            if entity.HasField("alert"):
                alert = entity.alert
                alerte_data = {
                    "horodatage": time.strftime('%Y-%m-%d %H:%M:%S'),  # Ajoute un horodatage de récupération
                    "lignes": [e.route_id for e in alert.informed_entity],
                    "trips": [e.trip.trip_id for e in alert.informed_entity if e.trip.trip_id],
                    "periode": {
                        "debut": convert_timestamp(alert.active_period[0].start) if alert.active_period else "Non spécifié",
                        "fin": convert_timestamp(alert.active_period[0].end) if alert.active_period else "Non spécifié"
                    },
                    "message": alert.description_text.translation[0].text if alert.description_text.translation else "Non spécifié"
                }
                alertes_list.append(alerte_data)

        # Charger les alertes existantes si le fichier existe
        if os.path.exists(output_file):
            with open(output_file, "r", encoding="utf-8") as f:
                try:
                    existing_data = json.load(f)
                    existing_alertes = existing_data.get("alertes", [])
                except json.JSONDecodeError:
                    existing_alertes = []  # Si le fichier est corrompu, repartir à zéro
        else:
            existing_alertes = []

        # Ajouter les nouvelles alertes à l'historique
        existing_alertes.extend(alertes_list)

        # Écrire l'historique complet dans le fichier
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump({"alertes": existing_alertes}, f, indent=4, ensure_ascii=False)

        print(f"{len(alertes_list)} nouvelles alertes ajoutées. Historique total : {len(existing_alertes)} alertes.")

    except requests.RequestException as e:
        print("Erreur lors de la récupération des alertes:", e)

if __name__ == "__main__":
    fetch_alertes()
