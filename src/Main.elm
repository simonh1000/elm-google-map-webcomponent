port module Main exposing (Model, Msg(..), init, main, toJs, update, view)

import Browser
import Html exposing (..)
import Html.Attributes as Attribute exposing (..)
import Html.Events as Events
import Json.Decode as Decode exposing (Decoder, Value)
import Json.Encode as Encode



-- ---------------------------
-- PORTS
-- ---------------------------


port toJs : String -> Cmd msg



-- ---------------------------
-- MODEL
-- ---------------------------


type alias Model =
    { gkey : String
    , center : LatLng
    }


blankModel : String -> Model
blankModel gkey =
    { gkey = gkey
    , center = LatLng 39.4 -0.41
    }


init : String -> ( Model, Cmd Msg )
init gkey =
    ( blankModel gkey, Cmd.none )


type alias LatLng =
    { lat : Float, lng : Float }



-- ---------------------------
-- UPDATE
-- ---------------------------


type Msg
    = OnDragEnd MapBounds


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        OnDragEnd detail ->
            let
                _ =
                    Debug.log "detail" <| Debug.toString detail
            in
            ( model, Cmd.none )


type alias MapBounds =
    { north : Float
    , east : Float
    , south : Float
    , west : Float
    }


decodeMapBounds : Decoder MapBounds
decodeMapBounds =
    Decode.map4 MapBounds
        (Decode.field "north" Decode.float)
        (Decode.field "east" Decode.float)
        (Decode.field "south" Decode.float)
        (Decode.field "west" Decode.float)



-- ---------------------------
-- VIEW
-- ---------------------------


view : Model -> List (Html Msg)
view model =
    [ gmap model
    ]


gmap : Model -> Html Msg
gmap model =
    Html.node "google-map"
        [ Attribute.attribute "api-key" model.gkey
        , Attribute.attribute "latitude" <| String.fromFloat model.center.lat
        , Attribute.attribute "longitude" <| String.fromFloat model.center.lng
        , Attribute.attribute "drag-events" "true"
        , Events.on "google-map-dragend" (Decode.at [ "detail", "bounds" ] decodeMapBounds |> Decode.map OnDragEnd)
        ]
        [ gmarker model.center ]


gmarker : LatLng -> Html msg
gmarker { lat, lng } =
    Html.node "google-map-marker"
        [ Attribute.attribute "latitude" <| String.fromFloat lat
        , Attribute.attribute "longitude" <| String.fromFloat lng
        ]
        []



-- ---------------------------
-- MAIN
-- ---------------------------


main : Program String Model Msg
main =
    Browser.document
        { init = init
        , update = update
        , view =
            \m ->
                { title = "Elm 0.19 starter"
                , body = view m
                }
        , subscriptions = \_ -> Sub.none
        }
