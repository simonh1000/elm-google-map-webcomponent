port module Main exposing (Model, Msg(..), init, main, toJs, update, view)

import Browser
import Browser.Navigation exposing (Key)
import Html exposing (..)
import Html.Attributes as Attribute exposing (..)
import Html.Events exposing (onClick)
import Http exposing (Error(..))
import Json.Decode as Decode
import Url exposing (Url)



-- ---------------------------
-- PORTS
-- ---------------------------


port toJs : String -> Cmd msg



-- ---------------------------
-- MODEL
-- ---------------------------


type alias Model =
    { key : Key
    , message : String
    }


blankModel : Key -> Model
blankModel key =
    { key = key, message = "init" }


init : flags -> Url -> Key -> ( Model, Cmd Msg )
init _ _ key =
    ( blankModel key, Cmd.none )



-- ---------------------------
-- UPDATE
-- ---------------------------


type Msg
    = Click
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        Click ->
            ( { model | message = "clicked" }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )



-- ---------------------------
-- VIEW
-- ---------------------------


view : Model -> List (Html Msg)
view model =
    [ div [ class "button" ] [ button [ onClick Click ] [ text "Click me" ] ]
    , div [ class "message" ] [ text model.message ]
    , gmap
    ]


gmap =
    Html.node "google-map"
        [ Attribute.attribute "api-key" "AIzaSyDPGdhFftpVU-QW4ihbXi6IuLw1DUriYJ0"
        , Attribute.attribute "latitude" "52"
        , Attribute.attribute "longitude" "5"
        ]
        []



-- ---------------------------
-- MAIN
-- ---------------------------


main : Program Int Model Msg
main =
    Browser.application
        { init = init
        , update = update
        , view =
            \m ->
                { title = "Elm 0.19 starter"
                , body = view m
                }
        , subscriptions = \_ -> Sub.none
        , onUrlChange = \_ -> NoOp
        , onUrlRequest = \_ -> NoOp
        }
